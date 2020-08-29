class ProductController
{
    constructor(){
        this.mongoDB = require("mongodb");
        this.mongoClient = this.mongoDB.MongoClient;
    }

    connectToDB(){
        let dbPromise= new Promise((resolve, reject) => {
            let conStr = 'mongodb://localhost:27017/EcommerceProject';
            this.mongoClient.connect(conStr,{ useNewUrlParser: true },(err, mongoCon) =>{
                if(err){
                    console.log("Error in connection to DB");
                    reject (err);
                }
                else{
                    console.log("Connection Established...");
                   
                    resolve (mongoCon);
                }
            });
        });
        return dbPromise;
    }

    async insertProduct(product){
        let mongoCon= await this.connectToDB();
        const dbCon = mongoCon.db("EcommerceProject");
        //console.log("from insert func"+product);
       // console.log("from insert func2"+JSON.parse(product));
        dbCon.collection("product").insertOne(JSON.parse(product), (err, res) => {
            if(err)
                return err;
            else{
                console.log("Product Inserted");
                mongoCon.close();
                return "Product Inserted...";
            }
        });
    }

    getAllProducts(){
        return new Promise((resolve, reject) =>{
            this.connectToDB().then((mongoCon) =>{
                const dbCon = mongoCon.db("EcommerceProject");
                dbCon.collection("product").find().toArray((err, result) => {
                    if(err){
                        console.log("Error in getting data..");
                        reject(err);
                    }
                    else{
                        console.log("Get Data successfully..")
                        mongoCon.close();
                        resolve(result);
                    }
                })
            })
        });
    }
    getProduct(id){
        return new Promise((resolve, reject) =>{
            this.connectToDB().then((mongoCon) =>{
                const dbCon = mongoCon.db("EcommerceProject");
                //console.log(id);
                dbCon.collection("product").find({"_id":id}).toArray((err, result) => {
                    if(err){
                        console.log("Error in getting data..");
                        reject(err);
                    }
                    else{
                        console.log("Get Data successfully..");
                  //      console.log(result);
                        mongoCon.close();
                        resolve(result);
                    }
                })
            })
        });
    }
    async editProduct(prd){
        let mongoCon= await this.connectToDB();
        const dbCon = mongoCon.db("EcommerceProject");
        console.log("from edit func"+`${prd._id}`);
        let product=JSON.parse(prd);
        //console.log(product.Name);
        console.log(`${product._id}`);
        dbCon.collection("product").update({'_id':`${product._id}`}, product, (err, res) => {
            if(err)
                return err;
            else{
                console.log("Product edited...");
                console.log(JSON.parse(prd));
                mongoCon.close();
                return "Product edited...";
            }
        });
    }
    async deleteProduct(prd){
        let mongoCon= await this.connectToDB();
        const dbCon = mongoCon.db("EcommerceProject");
        //console.log("from delete func"+`${prd._id}`);
        let product=JSON.parse(prd);
        //console.log(product.Name);
        console.log(`${product[0]._id}`);
        dbCon.collection("product").remove({'_id':`${product[0]._id}`},(err, res) => {
            if(err)
                return err;
            else{
                console.log("Product removed...");
                console.log(JSON.parse(prd));
                mongoCon.close();
                return "Product removed...";
            }
        });
        
    }
    
}

module.exports=ProductController;