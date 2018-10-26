const level = require('level');

class LevelDbApi{
    constructor(dbName){
        this._dbName = dbName;
        this._db = null;
    }
    _isOpen(){
        if(this._db){
            return true;
        }
        return false;
    }
    open(){
        this._db = level(this._dbName);
    }
    close(callback){
        return this._db.close((err)=>{
            if(callback){
                callback(err);
            }else{
                console.log("[-] err closing db" , err);
            }
        });
    }
    put(key,value,callback){
        if(this._isOpen()){
            this._db.put(key,value,(err)=>{
                callback(err);
            });
        }else{
            callback("db closed");
        }
    }
    get(key,callback){
        if(this._isOpen()){
            this._db.get(key,(err,value)=>{
                callback(err,value);
            });
        }else{
            callback("db closed");
        }
    }
    // put value only if it doesn't exist.
    safePut(key,value,callback){
        if(this._isOpen()){
            this.get(key,(err,value)=>{
                if(err){
                    // value dont exist
                    this.put(key,value, (err)=>{
                        callback(err);
                    });
                }else{
                    // value exists
                    callback("value exists");
                }
            });
        }else{
            callback("db closed");
        }
    }
    putBatch(objs, callback){
        let operations = [];
        objs.forEach(o=>{
            operations.push({type:'put',key:o.key, value: o.value});
        });
        this._batch(operations,(err)=>{
            callback(err);
        });
    }
    _batch(operations,callback){
        if(this._isOpen()){
            this._db.batch(operations, err=> {
                callback(err);
            })
        }else{
            callback("db closed");
        }
    }

    getAllStream(callback){
        if(this._isOpen()){
            this._db.createReadStream()
                .on('data', function (data) {
                    callback("data",data.key,data.value);
                })
                .on('error', function (err) {
                    callback("error",err);
                })
                .on('close', function () {
                    callback("close");
                })
                .on('end', function () {
                    callback("end");
                });
        }else{
            callback("close");
        }

    }

}
module.exports = LevelDbApi;

/** mini test * /
 *
 */
// let hexKey = '0xd00fb2b59610c1dc98929e0891b4ef3bba493d18e39e6d4eb949c811ccc52944';
// let byteKey = [208, 15, 178, 181, 150, 16, 193, 220, 152, 146, 158, 8, 145, 180, 239, 59, 186, 73, 61, 24, 227, 158, 109, 78, 185, 73, 200, 17, 204, 197, 41, 68];
// let byteKey2 = [208, 15, 178, 181, 150, 16, 193, 220, 152, 146, 158, 8, 145, 180, 239, 59, 186, 73, 61, 24, 227, 158, 109, 78, 185, 73, 200, 17, 204, 197, 41, 68];
// let byteKey3 = [208, 15, 178, 181, 150, 16, 193, 220, 152, 146, 158, 8, 145, 180, 239, 59, 186, 73, 61, 24, 227, 158, 109, 78, 185, 73, 200, 17, 204, 197, 41, 68];
// let db = new LevelDbApi("./here");
// db.open();
// db.put(byteKey, JSON.stringify({deltas : [byteKey2, byteKey3]}, (err)=>{
//     console.log("is err? ");
//
//     db.get(byteKey, (err,value)=>{
//         console.log("is err? " + err);
//         console.log(JSON.parse(value).deltas.length);
//     })
// });

