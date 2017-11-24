// AddressLine
var cryptoAddress = Vue.component('crypto-address', {
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
        <button type="button" rel="tooltip" title="Send" class="btn btn-primary btn-simple btn-xs" data-toggle="modal" :data-address="data.address" data-target="#myModalSend">
            <i class="material-icons">send</i>
        </button>
        <button type="button" rel="tooltip" title="Receive" class="btn btn-primary btn-simple btn-xs" data-toggle="modal" :data-address="data.address" data-target="#myModalReceive">
            <i class="material-icons">move_to_inbox</i>
        </button>
    </td>
    </tr>`,
    props: ['data'],
    data: function() {
        return {
            balance: 'loading...'
        };
    },
    mounted: function() {
        localStorage.setItem("totalBalance", 0);
        var self = this;
        $.ajax({
            url: "https://chain.potcoin.com/api/addr/" + self.data.address,
            method: 'GET',
            success: function(data) {
                self.balance = numeral(data.balance).format('0.00000000');
                var totalBalance = numeral(localStorage.getItem("totalBalance")).format('0.00000000');
                var sum = parseFloat(totalBalance) + parseFloat(self.balance);
                localStorage.setItem("totalBalance", numeral(sum).format('0.00000000'));
            },
            error: function(error) {
                self.balance = 'error';
            }
        });
    },
    methods: {
        showPrivate: function(privatekey) {
            $.notify(privatekey);
        },
    }
});

var vm = new Vue({
    el: "#app",
    data: {
        urlToCheck: "https://chain.potcoin.com/api/peer",
        isOnline: false,
        timeAgo: "",
        pollInterval: 60000, //1 minute
        interval: "",
        coin: "potcoin",
        fiat: "CAD",
        currentYear: new Date().getFullYear(),
        potcoin: {},
        mnemo: "",
        seed: "",
        password: "",
        logged: false,
        addresses: [],
        totalBalance: 0,
    },
    mounted: function() {
        // if xpriv is in memory then is logged
        var xpriv = localStorage.getItem("xpriv");
        if (xpriv) {
            this.logged = true;
            this.pollInfo();
            this.addresses = Wallet.generateHD(xpriv);
        } else {
            this.generate();
        }
    },
    computed: {
        totalBtc: function() {
            return this.totalBalance * 585858;
        },
        totalCad: function() {
            return this.totalBalance * 1111;
        },
        totalUsd: function() {
            return this.totalBalance * 9999;
        }
    },
    methods: {
        generate: function() {
            this.mnemo = Wallet.generateNemo();
        },
        login: function() {
            try {
                //Get the master key
                var xpriv = Wallet.getMasterKey(this.seed, this.password);
                // Storage
                localStorage.setItem("xpriv", xpriv);
                localStorage.setItem("loginTime", moment().format());
                // Clear useless data
                this.mnemo = "";
                this.seed = "";
                this.password = "";
                this.logged = true;
                this.pollInfo();
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
            this.totalUsd = 0;
            clearInterval(this.interval); // Stops pollInfo
        },
        callInfoApi: function() {
            var self = this;
            $.ajax({
                url: "https://api.coinmarketcap.com/v1/ticker/" + self.coin + "/?convert=" + self.fiat,
                method: 'GET',
                success: function(data) {
                    self.potcoin = data[0];
                    self.totalBalance = localStorage.getItem("totalBalance");
                },
                error: function(error) {
                    console.error(error);
                }
            });
        },
        checkOnline: function() {
            var self = this;
            $.ajax({
                url: self.urlToCheck,
                method: 'GET',
                success: function(data) {
                    self.isOnline = true;
                    localStorage.setItem("lastSync", moment().format());
                    self.timeAgo = moment(localStorage.getItem("lastSync")).fromNow();
                },
                error: function(error) {
                    self.isOnline = false;
                    if (localStorage.getItem("lastSync")) {
                        self.timeAgo = moment(localStorage.getItem("lastSync")).fromNow();
                    }
                }
            });
        },
        pollInfo: function() {
            if (this.logged) {
                this.refreshWallet();
                this.interval = setInterval(function() {
                    this.refreshWallet();
                }.bind(this), this.pollInterval);
            }
        },
        refreshWallet: function() {
            this.callInfoApi();
            this.checkOnline();
        },
    },
});