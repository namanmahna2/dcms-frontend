import { toast } from "react-toastify";
import Cookies from "js-cookie";
import axios from "axios";
import Toast from "../utils/toast";

export default class Server {
    // static BASE_URL = process.env.REACT_APP_API_URL;
    static BASE_URL = "http://localhost:3011/api";
    static onLogout = null;
    static onForbidden = null;

    static setLogoutCallback(callback) {
        this.onLogout = callback;
    }

    static setForbiddenCallback(callback) {
        this.onForbidden = callback;
    }

    static async makeRequest(
        method,
        endpoint,
        data = {},
        params = {},
        hasRetried = false
    ) {
        try {
            console.log("API CALL =>", endpoint, new Date().toISOString());
            const accessToken = Cookies.get("x-access-token");

            const response = await axios({
                method,
                url: `${this.BASE_URL}${endpoint}`,
                data,
                params,
                headers: {
                    ...(data instanceof FormData
                        ? {}
                        : { "Content-Type": "application/json" }),
                    "x-access-token": accessToken || "",
                },
                withCredentials: true,
            });

            return response.data;
        } catch (error) {
            if (!error.response) {
                Toast.error("Backend server is not reachable.");
                throw error;
            }

            const status = error.response.status;
            const message =
                error.response?.data?.message?.toLowerCase();

            const isRefreshing = endpoint === "/users/refresh";

            if (
                status === 401 &&
                !isRefreshing &&
                !hasRetried &&
                (
                    message?.includes("token expired") ||
                    message?.includes("token verification failed")
                )
            ) {
                try {
                    if (!this.refreshPromise) {
                        this.refreshPromise = axios.post(
                            `${this.BASE_URL}/users/refresh`,
                            {},
                            { withCredentials: true }
                        );
                    }

                    await this.refreshPromise;
                    this.refreshPromise = null;

                    return this.makeRequest(
                        method,
                        endpoint,
                        data,
                        params,
                        true
                    );
                } catch (err) {
                    this.refreshPromise = null;

                    Cookies.remove("x-access-token");
                    Cookies.remove("refresh-token");

                    if (typeof this.onLogout === "function") {
                        this.onLogout();
                    }

                    throw err;
                }
            }

            throw error;
        }
    }


    // Users
    static async signup(obj) {
        return this.makeRequest("post", "/users/v1/signup", obj);
    }

    static async signin(email, password) {
        return this.makeRequest("post", "/users/v1/login", { email, password });
    }
    static async signout() {
        return this.makeRequest("patch", "/users/v1/signout");
    }

    static async userProfile() {
        return this.makeRequest("get", "/users/v1/profile");
    }

    static async isAdmin() {
        return this.makeRequest("get", "/users/v1/admin/verify");
    }
    static async updateUserProfile(data = {}) {
        console.log("data for update", data)
        return this.makeRequest("patch", "/users/v1/profile", data);
    }



    // Students
    static async getAllStudents(params = {}) {
        return this.makeRequest("get", "/students/v1/all", {}, params);
    }

    static async insertStudent(data) {
        return this.makeRequest("post", "/students/v1/in", data);
    }

    static async getStudentById(id) {
        return this.makeRequest("get", `/students/v1/info/${id}`)
    }
    static async getDegreeTrend() {
        return this.makeRequest("get", `/students/v1/trend/degree`)
    }

    static async updateStudentById(id, data) {
        return this.makeRequest("patch", `/students/v1/update/${id}`, data)
    }

    static async deleteStudentById(id) {
        return this.makeRequest("delete", `/students/v1/del/${id}`)
    }

    // Student login
    static async myDegrees() {
        return this.makeRequest("get", `/students/v1/degree/info`)
    }


    // Certificate
    static async issueDegree(id) {
        return this.makeRequest("post", `/cr/v1/issue`, { student_id: id })
    }

    static async revokeDegree(id, data) {
        return this.makeRequest("patch", `/cr/v1/revoke/${id}`, { reason: data?.reason ?? "" })
    }

    static async getAllCertData() {
        return this.makeRequest("get", `/cr/v1/view`)
    }

    static async verifyDegree(id) {
        return this.makeRequest("get", `/cr/v1/verify/${id}`)
    }
    static async verifyDegreeToken(token_id, qr_data) {
        return this.makeRequest("post", `/cr/v1/verify/token/${token_id}`, { qrPayload: qr_data })
    }



    // departments and courses
    static async getAllDepAndCourses() {
        return this.makeRequest("get", "/dc/v1/departments/courses")
    }



    // LOGS
    static async insertLog(data) {
        return this.makeRequest("post", `/bl_ch/v1/insert`, data)
    }
    static async getLogs(param) {
        const params = {}
        if (param) params["id"] = param
        return this.makeRequest("get", "/bl_ch/v1/logs", {}, params)
    }
    static async getLogsbyStudentID(id) {
        return this.makeRequest("get", `/bl_ch/v1/student/${id}`)
    }

    static async getDashboardRisk() {
        return this.makeRequest("get", "/bl_ch/v1/dashboard/risk")
    }

    static async blockIP(id) {
        return this.makeRequest("patch", `/bl_ch/v1/block/ip/${id}`)
    }

    //Studentlogin
    static async studentAlerts() {
        return this.makeRequest("get", `/bl_ch/v1/alerts`)
    }



    // dashboard
    static async getDashboardCardsData() {
        return this.makeRequest("get", `/users/v1/cards`)
    }
    static async dashboardRevokeStudents() {
        return this.makeRequest("get", `/students/v1/revoked`)
    }

}