new Vue({
    el: "#app",
    data: {
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
            this.callApi();
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
                this.callApi();
                //validate
                var xpriv = Wallet.getMasterKey(this.seed, this.password);
                // Storage
                localStorage.setItem("xpriv", xpriv);
                localStorage.setItem("time", new Date());
                this.logged = true;
                // Clear data
                this.mnemo = "";
                this.seed = "";
                this.password = "";

                //clear form
                //swap page
            } catch (err) {
                alert(err.message);
            }
        },
        logout: function() {
            localStorage.clear();
            this.generate(); // Force a new one when left the wallet
            this.logged = false;
        },
        callApi: function() {
            const vm = this;
            axios.get("https://api.coinmarketcap.com/v1/ticker/potcoin/")
                .then(function(response) {
                    vm.potcoin = response.data[0];
                })
                .catch(function(error) {
                    console.log(error);
                });
        }
    }
});