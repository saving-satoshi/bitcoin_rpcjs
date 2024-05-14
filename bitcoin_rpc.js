const fs = require('fs');

class Bitcoin {
    constructor() {
        this.state = JSON.parse(fs.readFileSync('chainstate.json', 'utf8'))
    }

    rpc(method, params) {
        if (!method) {
            throw new Error("First argument 'method' is required.\nExecute `rpc('help')` for help")
        }
        if (this[method]) {
            if (params) {
                return this[method](params)
            } else {
                return this[method]()
            }
        } else {
            throw new Error(`Method '${method}' not found\nExecute \`rpc('help')\` for help`)
        }
    }

    help() {
        return `
Bitcoin Core v253.1.2
RPC commands:

getinfo
    Returns basic node and network information

help
    Returns this message

getblock ( hash )
    Returns JSON-formatted block with the given hash

getblocksbyheight ( height )
    Returns an array of hashes of blocks at the specified height in the tree
`;
    }

    getblocksbyheight(height) {
        if (!height) {
            throw new Error("Method 'getblocksbyheight' requires one argument (height)");
        }
        if (!(height in this.state["blocks_by_height"])) {
            throw new Error(`No blocks available at height ${height}`);
        }
        return this.state["blocks_by_height"][height];
    }

    getblock(bhash) {
        if (!bhash) {
            throw new Error("Method 'getblock' requires one argument (hash)");
        }
        if (!(bhash in this.state["blocks_by_hash"])) {
            throw new Error(`Block not found with hash ${bhash}`);
        }
        const block = JSON.parse(JSON.stringify(this.state["blocks_by_hash"][bhash]));
        delete block.valid;
        return block;
    }

    getinfo() {
        return {
            version: "Bitcoin Core v253.1.2",
            blocks: parseInt(Math.max(...Object.keys(this.state["blocks_by_height"]))),
            headers: parseInt(Math.max(...Object.keys(this.state["blocks_by_height"]))),
            prune_height: parseInt(Math.min(...Object.keys(this.state["blocks_by_height"]))),
            verification_progress: "1.0000",
            difficulty: "3007592928481984.23",
            peers: 23
        };
    }
}

module.exports = Bitcoin;
