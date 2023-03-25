class AddAssetModalController {
    constructor(emitter){
        this.emitter = emitter;
        this.model = {
            display: false,
            message: ""
        }
        this.emitter.on("showModal:addAsset",()=>{this.model.display = true})
    }

    static async getInstance(emitter){
        const a = new AddAssetModalController(emitter)        
        return a;
    }

    async _handleCancel(e, that){
        that.model.display = false
    }

    async _handleOK(e, that){
        that.emitter.emit("AddAssetModalController:json", JSON.parse(that.model.message))
        that.model.display = false
    }
}