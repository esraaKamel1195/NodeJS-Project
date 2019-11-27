var http= require ('http');
var express = require('express');
var app = express();
var httpserver=http.createServer(app);
var cors = require('cors');
var bodyParser = require('body-parser');
var multer= require('multer');
var socket= require('socket.io');
var io=socket.listen(httpserver);


var productControllerClass = require("./controller");
var productController = new productControllerClass();


//app.use(()=>express.static('files'));
app.use(express.static('Resources'));
//console.log(__dirname);
app.use(bodyParser.urlencoded({extended:false}));

app.use(cors({origin: "*"}));
io.on("connection", function(client){

	client.on("Buy",function(Id,Quantity){
		console.log(Id.toString());
        productController.getProduct(Id.toString())
            .then((data) => {
                console.log(data);
                 data[0].Quantity=(parseInt(data[0].Quantity)-parseInt(Quantity)).toString();
                 console.log(data[0]);
                 productController.editProduct(JSON.stringify(data[0]))
                        .then(()=>{
                            console.log("edited to quantity done");
                            console.log(data[0].Quantity);
                           io.emit("updateDone",Id,data[0].Quantity) ;
                        });
        });
	});
});


var fileStorage =   multer.diskStorage({
    destination: function (req, file, callback) {
      callback(null, './Resources/Images');
     
    },
    filename: function (req, file, callback) {
        console.log(file.mimetype);
        console.log(file.originalname);
      callback(null, file.originalname);
    }
});

var upload = multer({ storage : fileStorage}).single('Image');


app.get('/',function(req,res)
{
   
    res.sendFile(__dirname+"/"+"IndexDB.html");
});

app.get("/getProducts",function(reg,res){
    
    productController.getAllProducts()
        .then((data) => {
            console.log(data);
            res.send(JSON.stringify(data));
        });
});

app.get("/add",function(req,res){
    res.sendFile(__dirname+"/"+"AddProduct.html");
});



app.post('/insert',upload,function(req,res){
   // console.log("Insert:" + JSON.stringify(req.body));
   // console.log(req.file.originalname);
    //console.log(req.body.Name);
    //var Image=req.file.originalname;
    //console.log(Image);
   // req.body+=`Image:${Image}`;
    
   // let newProduct= JSON.stringify(req.body);
    //newProduct+=`Image:"${Image}"`;
    let newProduct={"_id":`${req.body._id}`,
    "Name":`${req.body.Name}`,
    "Price":`${req.body.Price}`,
    "brand":`${req.body.brand}`,
    "model":`${req.body.model}`,
    "color":`${req.body.color}`,
    "details":`${req.body.details}`,
    "weight":`${req.body.weight}`,
    "date":`${req.body.date}`,
    "Quantity":`${req.body.Quantity}`,
    "Image":`${req.file.originalname}`};
    console.log(newProduct);
    productController.insertProduct(JSON.stringify(newProduct))
        .then(() => {
            console.log("Inserted")
            
            res.redirect('/');
    });

});

app.get('/edit/:_id',function(req,res){
    var html;
    productController.getProduct(req.params._id)
        .then((data1) => {
           //console.log(req.params._id); 
           //var data1=JSON.stringify(data);
           console.log(data1);
           console.log(`${data1[0]._id}`);
           var x=(parseInt(data1[0].Quantity)-5);
           html=`
           <!DOCTYPE html> 
           <head>
               <title> Edit Product</title>
           </head>
           <body>
              <form action="http://localhost:5000/update" method="post" enctype="multipart/form-data">
                <label> Product ID:</label>
                <input type="number" value=${data1[0]._id} name="_id" required readonly><br>
                <label>Name</label>
                <input type="text" name="Name" value=${data1[0].Name} required /><br><br>
                <label>Price</label>
                <input type="number" name="Price" value=${data1[0].Price} required /><br> <br>
                <label>Quantity</label>
                <input type="number" name="Quantity" value=${data1[0].Quantity} required /><br> <br>
                <label>Image</label>
                <input type="file" name="Image" value=${data1[0].Image} required /><br> <br>
                <label>Product Brand:</label>
                <input type="text" value=${data1[0].brand} name="brand" required><br> <br>
                <label>Product Model:</label>
                <input type="text" name="model" value=${data1[0].model} required><br> <br>
                <label>Product Color:</label>
                <input type="text" name="color" value=${data1[0].color} required><br><br> 
                <label>Product Details:</label>
                <input type="text" name="details" value=${data1[0].details} required><br><br>
                <label>Product weight:</label>
                <input type="number" name="weight" value=${data1[0].weight} required><br><br>
                <label>Product Data:</label>
                <input type="datetime" name="date" value=${data1[0].date} required><br><br>
                <input type="submit" value="send" />
              </form>
           </body>
           </html>
       `;
       res.send(html);
        });

});
app.post ('/update',upload,function(req,res){
    //let editedProduct=JSON.stringify(req.body);

    let editedProduct={"_id":`${req.body._id}`,
    "Name":`${req.body.Name}`,
    "Price":`${req.body.Price}`,
    "brand":`${req.body.brand}`,
    "model":`${req.body.model}`,
    "color":`${req.body.color}`,
    "details":`${req.body.details}`,
    "weight":`${req.body.weight}`,
    "date":`${req.body.date}`,
    "Quantity":`${req.body.Quantity}`,
    "Image":`${req.file.originalname}`};
    productController.editProduct(JSON.stringify(editedProduct))
            .then(()=>{
                console.log("edit done");

                res.redirect('/');
            })
});
app.get('/delete/:_id',function(req,res){
    productController.getProduct(req.params._id)
        .then((data)=>{
           let deleteedProduct=JSON.stringify(data);
           productController.deleteProduct(deleteedProduct)
               .then(()=>{
                   console.log("delete done");
                   res.redirect('/');
               });     
        });
});  
 
httpserver.listen(5000, function () {});