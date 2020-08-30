var PORT= process.env.PORT || 5000;
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
               <meta charset="utf-8">
               <meta name="viewport" content="width=device-width, initial-scale=1">
               <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
               <!-- Latest compiled and minified CSS -->
               <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css">
               
               <!-- jQuery library -->
               <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script>
               
               <!-- Popper JS -->
               <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.7/umd/popper.min.js"></script>
               
               <!-- Latest compiled JavaScript -->
               <script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js"></script>
           </head>
           <body>
                <h1 class='text-center alert alert-primary alert-sm font-italic mb-0'>Edit Product</h1>

                <form action="http://localhost:5000/update" method="post" class="col-md-5 text-body offset-md-4 align-content-center bg-light"
                               enctype="multipart/form-data">
                  <div class="form-group">             
                    <label> Product ID:</label>
                    <input type="number" value=${data1[0]._id} class="form-control" name="_id" required readonly>
                  </div>
                  <div class="form-group">
                    <label>Name</label>
                    <input type="text" name="Name" class="form-control" value=${data1[0].Name} required /><br>
                  <div class="form-group"> 
                    <label>Price</label>
                    <input type="number" name="Price" class="form-control" value=${data1[0].Price} required /><br>
                  </div>
                  <div class="form-group">
                    <label>Quantity</label>
                    <input type="number" name="Quantity" class="form-control" value=${data1[0].Quantity} required /><br>
                  <div class="form-group">
                    <label>Product Brand:</label>
                    <input type="text" value=${data1[0].brand} class="form-control" name="brand" required><br>
                  </div>
                  <div class="form-group">
                    <label>Product Model:</label>
                     <input type="text" name="model" class="form-control" value=${data1[0].model} required><br>
                  </div>
                  <div class="form-group">   
                    <label>Product Color:</label>
                    <input type="text" name="color" class="form-control" value=${data1[0].color} required><br>
                  </div>
                  <div class="form-group">  
                    <label>Product Details:</label>
                    <input type="text" name="details" class="form-control" value=${data1[0].details} required><br>
                  </div>
                  <div class="form-group"> 
                    <label>Product weight:</label>
                    <input type="number" name="weight" class="form-control" value=${data1[0].weight} required><br>
                  </div> 
                  <div class="form-group"> 
                    <label>Product Data:</label>
                    <input type="datetime" name="date" class="form-control" value=${data1[0].date} required><br>
                  </div>
                  <div class="form-group">
                    <label>Image</label>
                    <input type="file" name="Image" class="form-control" value=${data1[0].Image} required /><br>
                  </div>
                  <div class="form-group">  
                    <input type="submit" value="Edit" style="width:100%;" class="btn btn-primary" /><br>
                  </div>
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
 
httpserver.listen(PORT, function () {});