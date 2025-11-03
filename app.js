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
const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 Edg/119.0.0.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64; rv:121.0) Gecko/20100101 Firefox/121.0',
    'Mozilla/5.0 (X11; Linux x86_64; rv:120.0) Gecko/20100101 Firefox/120.0',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1',
    'Mozilla/5.0 (iPad; CPU OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1',
    'Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.144 Mobile Safari/537.36',
    'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.144 Mobile Safari/537.36',
    'Mozilla/5.0 (Android 14; Mobile; rv:121.0) Gecko/121.0 Firefox/121.0',
    'Mozilla/5.0 (Android 13; Mobile; rv:120.0) Gecko/120.0 Firefox/120.0'
];

class smmAPI {
    constructor(options) {
        this.key = options.key;
        this.api = options.api;
        this.proxy = options.proxy || [];
        if(!this.key) throw new Error("Please provide an API key.");
        if(!this.api) throw new Error("Please provide an API URL.");

        this.axiosInstance = axios.create({
            ...this.getRandomProxyConfig(),
            headers: {
                'User-Agent': this.getRandomUserAgent()
            }
        });
    }

    getRandomUserAgent() {
        return userAgents[Math.floor(Math.random() * userAgents.length)];
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
                if (typeof res.data === 'object') {
                    try {
                        const normalizedData = JSON.parse(JSON.stringify(res.data));
                        if (normalizedData) {
                            return normalizedData;
                        } else {
                            throw new Error('Failed to normalize object');
                        }
                    } catch (error) {
                        return { status: "systemError", error: 'Failed to process the object. Check your data structure.' };
                    }
                }
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
                if (typeof res.data === 'object') {
                    try {
                        const normalizedData = JSON.parse(JSON.stringify(res.data));
                        if (normalizedData) {
                            return normalizedData;
                        } else {
                            throw new Error('Failed to normalize object');
                        }
                    } catch (error) {
                        return { status: "systemError", error: 'Failed to process the object. Check your data structure.' };
                    }
                }
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
            
            if (res.headers['content-type'] !== 'application/json' && !Array.isArray(res.data) && res.headers['content-type'] !== 'application/json; charset=UTF-8' || !res.data) {
                if (typeof res.data === 'object') {
                    try {
                        const normalizedData = JSON.parse(JSON.stringify(res.data));
                        if (normalizedData) {
                            return normalizedData;
                        } else {
                            throw new Error('Failed to normalize object');
                        }
                    } catch (error) {
                        return { status: "systemError", error: 'Failed to process the object. Check your data structure.' };
                    }
                }
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
            
            if (res.headers['content-type'] !== 'application/json' && !Array.isArray(res.data) && res.headers['content-type'] !== 'application/json; charset=UTF-8' || !res.data) {
                if (typeof res.data === 'object') {
                    try {
                        const normalizedData = JSON.parse(JSON.stringify(res.data));
                        if (normalizedData) {
                            return normalizedData;
                        } else {
                            throw new Error('Failed to normalize object');
                        }
                    } catch (error) {
                        return { status: "systemError", error: 'Failed to process the object. Check your data structure.' };
                    }
                }
                return { status: "systemError", error: 'An error occurred while fetching your balance. Maybe your proxy is not working.', details: res?.data };
            } else {
                return res.data;
            }
        } catch (e) {
            return  { status: "systemError", error: e?.response?.data || 'An error occurred while fetching your balance. Maybe your proxy is not working.', details: res?.data };
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
            
            if (res.headers['content-type'] !== 'application/json' && !Array.isArray(res.data) && res.headers['content-type'] !== 'application/json; charset=UTF-8' || !res.data) {
                if (typeof res.data === 'object') {
                    try {
                        const normalizedData = JSON.parse(JSON.stringify(res.data));
                        if (normalizedData) {
                            return normalizedData;
                        } else {
                            throw new Error('Failed to normalize object');
                        }
                    } catch (error) {
                        return { status: "systemError", error: 'Failed to process the object. Check your data structure.' };
                    }
                }
                return { status: "systemError", error: 'An error occurred while fetching your balance. Maybe your proxy is not working.', details: res?.data };
            } else {
                return res.data;
            }
        } catch (e) {
            return  { status: "systemError", error: e?.response?.data || 'An error occurred while fetching your balance. Maybe your proxy is not working.', details: res?.data };
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
                if (typeof res.data === 'object') {
                    try {
                        const normalizedData = JSON.parse(JSON.stringify(res.data));
                        if (normalizedData) {
                            return normalizedData;
                        } else {
                            throw new Error('Failed to normalize object');
                        }
                    } catch (error) {
                        return { status: "systemError", error: 'Failed to process the object. Check your data structure.' };
                    }
                }
                return { status: "systemError", error: 'An error occurred while fetching services. Maybe your proxy is not working.', details: res?.data };
            } else {
                return res.data;
            }

        } catch (e) {
            return e?.response?.data || { status: "error", error: 'An error occurred while adding an order.' };
        }
    };

    async orderCancel({ order }) {
        try {
            let res = await this.axiosInstance.post(this.api, qs.stringify({
                key: this.key,
                action: "cancel",
                order: order
            }), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });

            if (res.headers['content-type'] !== 'application/json' && !Array.isArray(res.data) && res.headers['content-type'] !== 'application/json; charset=UTF-8' || !res.data) {
                if (typeof res.data === 'object') {
                    try {
                        const normalizedData = JSON.parse(JSON.stringify(res.data));
                        if (normalizedData) {
                            return normalizedData;
                        } else {
                            throw new Error('Failed to normalize object');
                        }
                    } catch (error) {
                        return { status: "systemError", error: 'Failed to process the object. Check your data structure.' };
                    }
                }
                return { status: "systemError", error: 'An error occurred while fetching services. Maybe your proxy is not working.', details: res?.data };
            } else {
                return res.data;
            }
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

            if (res.headers['content-type'] !== 'application/json' && !Array.isArray(res.data) && res.headers['content-type'] !== 'application/json; charset=UTF-8' || !res.data) {
                if (typeof res.data === 'object') {
                    try {
                        const normalizedData = JSON.parse(JSON.stringify(res.data));
                        if (normalizedData) {
                            return normalizedData;
                        } else {
                            throw new Error('Failed to normalize object');
                        }
                    } catch (error) {
                        return { status: "systemError", error: 'Failed to process the object. Check your data structure.' };
                    }
                }
                return { status: "systemError", error: 'An error occurred while fetching services. Maybe your proxy is not working.', details: res?.data };
            } else {
                return res.data;
            }
        } catch (e) {
            return  e?.response?.data || { status: "error", error: 'An error occurred while refilling an order.' };
        }
    };

    async refillStatus({ order }) {
        try {
            let res = await this.axiosInstance.post(this.api, qs.stringify({
                key: this.key,
                action: "refill_status",
                order: order
            }), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });

            if (res.headers['content-type'] !== 'application/json' && !Array.isArray(res.data) && res.headers['content-type'] !== 'application/json; charset=UTF-8' || !res.data) {
                if (typeof res.data === 'object') {
                    try {
                        const normalizedData = JSON.parse(JSON.stringify(res.data));
                        if (normalizedData) {
                            return normalizedData;
                        } else {
                            throw new Error('Failed to normalize object');
                        }
                    } catch (error) {
                        return { status: "systemError", error: 'Failed to process the object. Check your data structure.' };
                    }
                }
                return { status: "systemError", error: 'An error occurred while fetching services. Maybe your proxy is not working.', details: res?.data };
            } else {
                return res.data;
            }
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
            
            if (res.headers['content-type'] !== 'application/json' && !Array.isArray(res.data) && res.headers['content-type'] !== 'application/json; charset=UTF-8' || !res.data) {
                if (typeof res.data === 'object') {
                    try {
                        const normalizedData = JSON.parse(JSON.stringify(res.data));
                        if (normalizedData) {
                            return normalizedData;
                        } else {
                            throw new Error('Failed to normalize object');
                        }
                    } catch (error) {
                        return { status: "systemError", error: 'Failed to process the object. Check your data structure.' };
                    }
                }
                return { status: "systemError", error: 'An error occurred while fetching your balance. Maybe your proxy is not working.', details: res?.data };
            } else {
                return res.data;
            }
        } catch (e) {
            return  { status: "systemError", error: e?.response?.data || 'An error occurred while fetching your balance. Maybe your proxy is not working.', details: res?.data };
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
