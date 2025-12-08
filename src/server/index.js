import { toast } from "react-toastify";
import Cookies from "js-cookie";
import axios from "axios";
import Toast from "../utils/toast";

export default class Server {
    static BASE_URL = "http://localhost:3011";
    static onLogout = null;
    static onForbidden = null;

    static setLogoutCallback(callback) {
        this.onLogout = callback;
    }

    static setForbiddenCallback(callback) {
        this.onForbidden = callback;
    }

    static async makeRequest(method, endpoint, data = {}, params = {}) {
        try {
            const accessToken = Cookies.get("x-access-token");

            const response = await axios({
                method,
                url: `${this.BASE_URL}${endpoint}`,
                data,
                params,
                headers: {
                    ...(data instanceof FormData ? {} : { "Content-Type": "application/json" }),
                    "x-access-token": accessToken || "",
                },
                withCredentials: true,
            });

            return response.data;
        } catch (error) {
            if (!error.response) {
                throw error;
            }

            const status = error.response.status;
            const message = error.response?.data?.message?.toLowerCase();
            const isRefreshing = endpoint === "/users/refresh";

            console.log("axios error response >>>", error.response);

            // 401 / refresh handling (unchanged)
            if (
                status === 401 &&
                !isRefreshing &&
                (message?.includes("token expired") || message?.includes("token verification failed"))
            ) {
                // ... your existing refresh logic ...
                if (!this.refreshPromise) {
                    this.refreshPromise = axios.post(`${this.BASE_URL}/users/refresh`, {}, {
                        withCredentials: true,
                    })
                        .then(() => {
                            console.log("Token refresh success");
                            this.refreshPromise = null;
                        })
                        .catch(async (refreshErr) => {
                            console.warn("Refresh token failed. Logging out.");

                            // 
                            await this.signout()

                            if (typeof this.onLogout === "function") {
                                this.onLogout();
                            }

                            this.refreshPromise = null;
                            throw new Error("Refresh token invalid");
                        });
                }

                await this.refreshPromise;
                return this.makeRequest(method, endpoint, data, params);
            } else if (status === 401 && error.response?.data?.forceLogout) {
                console.log("Force logout detected. Clearing cookies...");

                Cookies.remove("x-access-token");
                Cookies.remove("refresh-token");
                localStorage.removeItem("selectedTab");
                localStorage.removeItem("login info");

                if (typeof this.onLogout === "function") {
                    this.onLogout();
                }

                return;
            }

            // 🔥 403 Forbidden -> show page
            if (status === 403) {
                console.log("Handling forbidden (403) request");
                Toast.error(error.response?.data?.message || "Access denied.");

                if (typeof this.onForbidden === "function") {
                    this.onForbidden(error.response);
                }

                // Optionally: don’t rethrow, so React Query etc. doesn’t treat as error
                // return; 
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

    static async revokeDegree(id) {
        return this.makeRequest("patch", `/cr/v1/revoke/${id}`)
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