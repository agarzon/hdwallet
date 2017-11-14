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
    },
    created: function() {
        if (typeof(Storage) === "undefined") {
            alert("Sorry! No Web Storage support for your browser.");
            window.location.href = "/"; // Go home, do not insist!
        }

        // if xpriv is in memory then is logged
        if (localStorage.getItem("xpriv")) {
            this.logged = true;
            this.pollInfo();

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
            clearInterval(this.interval); // Stops pollInfo
        },
        callInfoApi: function() {
            var vm = this;
            axios.get("https://api.coinmarketcap.com/v1/ticker/" + vm.coin + "/?convert=" + vm.fiat)
                .then(function(response) {
                    vm.potcoin = response.data[0];
                })
                .catch(function(error) {
                    console.log(error);
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