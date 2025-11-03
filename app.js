const axios = require('axios');
const qs = require('qs');

var HttpsProxyAgent = require('https-proxy-agent').HttpsProxyAgent;
/*

   _____                     _______ __  _____  ____    ____ __        ___    ____  ____
  / ___/____  ___  ___  ____/ / ___//  |/  /  |/  / |  / / // /       /   |  / __ \/  _/
  \__ \/ __ \/ _ \/ _ \/ __  /\__ \/ /|_/ / /|_/ /| | / / // /_______/ /| | / /_/ // /  
 ___/ / /_/ /  __/  __/ /_/ /___/ / /  / / /  / / | |/ /__  __/_____/ ___ |/ ____// /   
/____/ .___/\___/\___/\__,_//____/_/  /_/_/  /_/  |___/  /_/       /_/  |_/_/   /___/   
    /_/            

*/

class smmAPI {
    constructor(options) {
        this.key = options.key;
        this.api = options.api;
        this.proxy = options.proxy || [];
        if(!this.key) throw new Error("Please provide an API key.");
        if(!this.api) throw new Error("Please provide an API URL.");

        this.axiosInstance = axios.create(this.getRandomProxyConfig());
    }

    getRandomProxyConfig() {
        if (this.proxy.length === 0) return {};

        const randomIndex = Math.floor(Math.random() * this.proxy.length);
        const proxy = this.proxy[randomIndex];
        const agent = new HttpsProxyAgent(`http://${proxy.auth.username}:${proxy.auth.password}@${proxy.host}:${proxy.port}`);

        return {
            httpsAgent: agent
        };
    }

    async getMyIP() {
        try {
            let res = await this.axiosInstance.get('https://ipinfo.io/json');

            return res.data;
        } catch (e) {
            return  e?.response?.data || { status: "error", error: 'An error occurred while fetching your IP address.' };
        }
    };

    async getBalance() {
        try {
            let res = await this.axiosInstance.post(this.api, qs.stringify({
                key: this.key,
                action: "balance"
            }), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });

            if (res.headers['content-type'] !== 'application/json' && !Array.isArray(res.data) && res.headers['content-type'] !== 'application/json; charset=UTF-8' || !res.data) {
                return { status: "systemError", error: 'An error occurred while fetching your balance. Maybe your proxy is not working.', details: res?.data };
            } else {
                return res.data;
            }
        } catch (e) {
            return  { status: "systemError", error: e?.response?.data || 'An error occurred while fetching your balance. Maybe your proxy is not working.', details: res?.data };
        }
    };

    async getServices() {
        try {
            let res = await this.axiosInstance.post(this.api, qs.stringify({
                key: this.key,
                action: "services"
            }), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });

            if (res.headers['content-type'] !== 'application/json' && !Array.isArray(res.data) && res.headers['content-type'] !== 'application/json; charset=UTF-8' || !res.data) {
                return { status: "systemError", error: 'An error occurred while fetching services. Maybe your proxy is not working.', details: res?.data };
            } else {
                return res.data;
            }
        } catch (e) {
            return  e?.response?.data || { status: "error", error: 'An error occurred while fetching services.' };
        }
    };

    async getStatus({ order }) {
        try {
            let res = await this.axiosInstance.post(this.api, qs.stringify({
                key: this.key,
                action: "status",
                order: order
            }), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });
            
            if (!res.data && !Array.isArray(res.data)) {
                return { status: "systemError", error: 'An error occurred while fetching services. Maybe your proxy is not working.', details: res?.data };
            } else {
                return res.data;
            }
        } catch (e) {
            return  e?.response?.data || { status: "error", error: 'An error occurred while fetching order status.' };
        }
    };

    async getMultipleStatus({ orders }) {
        try {
            let res = await this.axiosInstance.post(this.api, qs.stringify({
                key: this.key,
                action: "status",
                orders: orders.join(',')
            }), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });
            
            if (!res.data && !Array.isArray(res.data)) {
                return { status: "systemError", error: 'An error occurred while fetching services. Maybe your proxy is not working.', details: res?.data };
            } else {
                return res.data;
            }
        } catch (e) {
            return  e?.response?.data || { status: "error", error: 'An error occurred while fetching order status.' };
        }
    };

    async addOrder({ service, data }) {
        try {
            let res = await this.axiosInstance.post(this.api, qs.stringify({
                key: this.key,
                action: "add",
                service: service, 
                ...Object.keys(data).reduce((acc, key) => { return { ...acc, [key]: data[key] } }, {})
            }), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });

            if (res.headers['content-type'] !== 'application/json' && !Array.isArray(res.data) && res.headers['content-type'] !== 'application/json; charset=UTF-8' || !res.data) {
                return { status: "systemError", error: 'An error occurred while fetching services. Maybe your proxy is not working.', details: res?.data };
            } else {
                return res.data;
            }

        } catch (e) {
            return e?.response?.data || { status: "systemError", error: 'An error occurred while adding an order.' };
        }
    };

    async ordersCancel({ orders }) {
        try {
            let res = await this.axiosInstance.post(this.api, qs.stringify({
                key: this.key,
                action: "cancel",
                orders: orders
            }), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });

            return res.data;
        } catch (e) {
            return  e?.response?.data || { status: "error", error: 'An error occurred while cancelling an order.' };
        }
    };

    async refill({ order }) {
        try {
            let res = await this.axiosInstance.post(this.api, qs.stringify({
                key: this.key,
                action: "refill",
                order: order
            }), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });

            return res.data;
        } catch (e) {
            return  e?.response?.data || { status: "error", error: 'An error occurred while refilling an order.' };
        }
    };

    async refillStatus({ order }) {
        try {
            let res = await this.axiosInstance.post(this.api, qs.stringify({
                key: this.key,
                action: "refill_status",
                refill: order
            }), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });

            return res.data;
        } catch (e) {
            return e?.response?.data || { status: "error", error: 'An error occurred while fetching refill status.' };
        }
    };

    async refillMultipleStatus({ orders }) {
        try {
            let res = await this.axiosInstance.post(this.api, qs.stringify({
                key: this.key,
                action: "refill_status",
                refills: orders
            }), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });

            return res.data;
        } catch (e) {
            return e?.response?.data || { status: "error", error: 'An error occurred while fetching refill status.' };
        }
    };
}

module.exports = smmAPI;

/*

   _____                     _______ __  _____  ____    ____ __        ___    ____  ____
  / ___/____  ___  ___  ____/ / ___//  |/  /  |/  / |  / / // /       /   |  / __ \/  _/
  \__ \/ __ \/ _ \/ _ \/ __  /\__ \/ /|_/ / /|_/ /| | / / // /_______/ /| | / /_/ // /  
 ___/ / /_/ /  __/  __/ /_/ /___/ / /  / / /  / / | |/ /__  __/_____/ ___ |/ ____// /   
/____/ .___/\___/\___/\__,_//____/_/  /_/_/  /_/  |___/  /_/       /_/  |_/_/   /___/   
    /_/            

*/
