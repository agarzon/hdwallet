// AddressLIne
Vue.component('crypto-address', {
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
        <button type="button" rel="tooltip" title="Send" class="btn btn-primary btn-simple btn-xs" data-toggle="modal" data-target="#myModalSend">
            <i class="material-icons">send</i>
        </button>
        <button type="button" rel="tooltip" title="Receive" class="btn btn-primary btn-simple btn-xs" data-toggle="modal" data-target="#myModalReceive">
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
        var self = this;
        $.ajax({
            url: "https://chain.potcoin.com/api/addr/" + self.data.address,
            method: 'GET',
            success: function(data) {
                self.balance = data.balance;
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

new Vue({
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
        potcoin: [],
        mnemo: "",
        seed: "",
        password: "",
        logged: false,
        addresses: [],
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
            clearInterval(this.interval); // Stops pollInfo
        },
        callInfoApi: function() {
            var self = this;
            $.ajax({
                url: "https://api.coinmarketcap.com/v1/ticker/" + self.coin + "/?convert=" + self.fiat,
                method: 'GET',
                success: function(data) {
                    self.potcoin = data[0];
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
            // Get and sum balances
            // Make some math
        },
    }
});