// AddressLIne
Vue.component('crypto-address', {
  template: '<tr><td>{{ data.address }}</td><td>{{ data.balance }}</td></tr>',
  props: ['data'],
});

new Vue({
    el: "#app",
    data: {
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
    created: function() {
        if (typeof(Storage) === "undefined") {
            alert("Sorry! No Web Storage support for your browser.");
            window.location.href = "/"; // Go home, do not insist!
        }

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
                this.logged = true;
                this.pollInfo();
                //Get the master key
                var xpriv = Wallet.getMasterKey(this.seed, this.password);
                // Storage
                localStorage.setItem("xpriv", xpriv);
                localStorage.setItem("time", new Date());
                // Clear useless data
                this.mnemo = "";
                this.seed = "";
                this.password = "";
            } catch (err) {
                alert(err.message);
            }
        },
        logout: function() {
            localStorage.clear();
            this.generate(); // Force a new seed when left the wallet
            this.logged = false;
            this.addresses = [];
            clearInterval(this.interval); // Stops pollInfo
        },
        callInfoApi: function() {
            //var vm = this;
            this.$http.get("https://api.coinmarketcap.com/v1/ticker/" + this.coin + "/?convert=" + this.fiat)
                .then(response => {
                    this.potcoin = response.body[0];
                }, response => {
                    console.error(error);
                });
        },
        pollInfo: function() {
            if (this.logged) {
                this.callInfoApi();
                this.interval = setInterval(function () {
                    this.callInfoApi();
                }.bind(this), this.pollInterval);
            }
        },
        refreshWallet: function() {
            this.callInfoApi();
            // Get and sum balances
            // Make some math
        }
    }
});