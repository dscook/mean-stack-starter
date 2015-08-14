module.exports = {
    mongodb: {
        development: {
            db: 'mean-stack-starter',
            host: 'localhost',
            port: '27017',
            get url() {
                return this.host + ':' + this.port + '/' + this.db;
            }
        },
        production: {
            db: 'mean-stack-starter',
            host: 'localhost',
            port: '27017',
            get url() {
                return this.host + ':' + this.port + '/' + this.db;
            }
        }
    }
};
