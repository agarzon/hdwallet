/*jshint esversion: 6 */
Vue.use(AsyncComputed);

const vm = new Vue({
    el: "#app",
    data: {
        urlToCheck: "https://chain.potcoin.com/api/peer",
        isOnline: false,
        timeAgo: "",
        pollInterval: 30000, //30 seconds
        interval: "",
        coin: "potcoin",
        fiat: "CAD",
        currentYear: new Date().getFullYear(),
        mnemo: "",
        seed: "",
        password: "",
        logged: false,
        addresses: [],
        destination: "",
        amount: 0,
    },
    mounted: function() {
        // if xpriv is in memory then is logged
        var xpriv = localStorage.getItem("xpriv");
        if (xpriv) {
            this.logged = true;
            this.timer("start");
            this.addresses = Wallet.generateHD(xpriv);
        } else {
            this.generate();
        }
    },
    asyncComputed: {
        potcoin() {
            return this.getCryptoInfo();
        },
        totalBalance() {
            return new Promise(resolve =>
                setTimeout(() => resolve(localStorage.getItem("totalBalance")), 1000)
            );
        },
        totalBtc() {
            return new Promise(resolve =>
                setTimeout(() => resolve(numeral(this.totalBalance * this.potcoin.price_btc).format('0.00000000')), 1000)
            );
        },
        totalCad() {
            return new Promise(resolve =>
                setTimeout(() => resolve(numeral(this.totalBalance * this.potcoin.price_cad).format('0.00000000')), 1000)
            );
        },
        totalUsd() {
            return new Promise(resolve =>
                setTimeout(() => resolve(numeral(this.totalBalance * this.potcoin.price_usd).format('0.00000000')), 1000)
            );
        },
    },
    methods: {
        generate: function() {
            this.mnemo = Wallet.generateNemo();
        },
        login: function() {
            try {
                //Get the master key
                //var xpriv = Wallet.getMasterKey(this.seed, this.password);
                var xpriv = Wallet.getMasterKey("film speed midnight cave come federal horror unusual cute trap congress inherit", "superPassword");
                // Storage
                localStorage.setItem("xpriv", xpriv);
                localStorage.setItem("loginTime", moment().format());
                // Clear useless data after get the xpriv
                this.mnemo = "";
                this.seed = "";
                this.password = "";
                this.logged = true;
                this.timer("start");
                this.addresses = Wallet.generateHD(xpriv);
            } catch (err) {
                $.notify(err.message);
            }
        },
        logout: function() {
            localStorage.clear();
            this.generate(); // Force a new seed when left the wallet
            this.logged = false;
            this.timeAgo = "";
            this.addresses = [];
            this.totalBalance = 0;
            this.totalBtc = 0;
            this.totalCad = 0;
            this.timer("stop");
        },
        checkOnline: function() {
            this.$http.get(this.urlToCheck).then(response => {
                this.isOnline = true;
                localStorage.setItem("lastSync", moment().format());
                this.timeAgo = moment(localStorage.getItem("lastSync")).fromNow();
            }, response => {
                this.isOnline = false;
                if (localStorage.getItem("lastSync")) {
                    this.timeAgo = moment(localStorage.getItem("lastSync")).fromNow();
                }
            });
        },
        getCryptoInfo: function() {
            return this.$http.get("https://api.coinmarketcap.com/v1/ticker/" + this.coin + "/?convert=" + this.fiat)
                .then(response => response.data[0]);
        },
        timer: function(action) {
            if (action === "start") {
                this.checkOnline();
                this.interval = setInterval(function() {
                    this.checkOnline();
                    this.getCryptoInfo();
                }.bind(this), this.pollInterval);
            } else if (action === "stop") {
                clearInterval(this.interval);
            }
        },
        refreshWallet: function() {
            location.reload();
            //this.checkOnline();
            //this.getCryptoInfo();
            // Reload addresses and get balances
            // trigger reload balances
        },
        showPrivate: function(privatekey) {
            $.notify(privatekey);
        },
        sendTx: function() {
            var tx = Wallet.prepareTx("PFdzfENGEYdfXn6S8AZvRSijKpHixautkq ", "PWoPsoU6QW1qr2JW3dkqymjfABt44ZGk34", 1000000, "U7Wig5kPqXNN34dLN568hVk9sLsWxK1AbCdex1oRJwCsbFVxUM6K");
        },
    },
    components: {
        'crypto-address': {
            template: `<tr>
                <td>{{ data.id }}</td>
                <td>{{ data.address }}</td>
                <td>{{ balance }}</td>
                <td>
                    <button type="button" rel="tooltip" title="Show Private Key" class="btn btn-info btn-simple btn-xs" v-on:click="showPrivate(data.privatekey)">
                        <i class="material-icons">vpn_key</i>
                    </button>
                </td>
                <td>
                    <button type="button" rel="tooltip" title="Send" class="btn btn-primary btn-simple btn-xs" data-toggle="modal" :data-address="data.address" :data-balance="balance" data-target="#myModalSend">
                        <i class="material-icons">send</i>
                    </button>
                    <button type="button" rel="tooltip" title="Receive" class="btn btn-primary btn-simple btn-xs" data-toggle="modal" :data-address="data.address" data-target="#myModalReceive">
                        <i class="material-icons">move_to_inbox</i>
                    </button>
                </td>
            </tr>`,
            props: ['data'],
            asyncComputed: {
                balance: {
                    get() {
                        return this.getBalanceByAddr(this.data.address);
                    },
                    default: 'Loading...'
                }
            },
            methods: {
                showPrivate: function(privatekey) {
                    $.notify(privatekey);
                },
                getBalanceByAddr: function(address) {
                    localStorage.setItem("totalBalance", 0);
                    return this.$http.get("https://chain.potcoin.com/api/addr/" + address).then(response => {
                        var balance = numeral(response.body.balance).format('0.00000000');
                        var totalBalance = numeral(localStorage.getItem("totalBalance")).format('0.00000000');
                        var sum = parseFloat(totalBalance) + parseFloat(balance);
                        localStorage.setItem("totalBalance", numeral(sum).format('0.00000000'));
                        return balance;
                    });
                },
            },
        },
    },
});