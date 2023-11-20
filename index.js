import express from "express";
import mongoose from "mongoose";
import cors from 'cors';
import { config } from 'dotenv';

config();
const db_token = process.env.DB_TOKEN;
const port = process.env.API_PORT || 8000;

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
	origin: '*',
	optionsSuccessStatus: 200,
  
	methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
	preflightContinue: false,
	optionsSuccessStatus: 204,
  
	allowedHeaders: 'Content-Type, Authorization, X-Requested-With',
}));


const userConnection = mongoose.createConnection(db_token);

userConnection.on('error', (error) => {
	console.error('Error connecting to MongoDB:', error);
});

userConnection.once('open', () => {
	console.log('Connected to Database!');
});

const ToDosConnection = userConnection.useDb('ToDos');
const ToDoSchema = mongoose.Schema({
	title: String,
	description: String,
    isDone: Boolean,
	x: Number,
	y: Number
},{
	versionKey: false // Disable versioning
});

const ToDos = ToDosConnection.model("ToDo", ToDoSchema);


// Routes
app.get("/", (req,res) => {
	res.send("My API");
});

app.get("/showAllToDos", async (req,res) => {
	try{
		const allToDos = await ToDos.find();
		res.send( {message: "Successfully Fetched", allToDos: allToDos} );
	}catch(error){
		console.log("Error while Fetching All ToDos: ", error.message);
		res.status(500).send("An error occurred while fetching all the ToDos.");
	}
});

app.post("/addToDo", async (req, res) => {
	const { title, description, isDone, x, y } = req.body;
	const toDo = new ToDos({
		title, description, isDone, x, y
	});

	try{			
		await toDo.save();
		res.send( {message: "Sucessfully Added", toDo: toDo});
	}catch(error){
		console.log("Error while adding toDo into the database: ", error.message);
		res.status(500).send("An error occurred while adding the toDo.");
	}
});

app.post("/delete/:_id", async (req,res)=>{
	try{
		await ToDos.findByIdAndDelete(req.params._id);
		res.send( {message: "Successfully Deleted"} );
	}catch(error){
		console.log("Error while Deleting current toDo: ", error.message);
		res.status(500).send("An error occurred while deleting the toDo.");
	}
});

app.post("/markdone/:_id", async (req,res)=>{
	try{
		await ToDos.findOneAndUpdate(
			{ _id: req.params._id  },
			{ isDone: true }
		);
		res.send( {message: "Successfully Marked true"} );
	}catch(error){
		console.log("Error while Changing Status: ", error.message);
		res.status(500).send("An error occurred while updating the toDo.");
	}
});

app.post("/markundone/:_id", async (req,res)=>{
	try{
		await ToDos.findOneAndUpdate(
			{ _id: req.params._id  },
			{ isDone: false }
		);
		res.send( {message: "Successfully Marked false"} );
	}catch(error){
		console.log("Error while Changing Status: ", error.message);
		res.status(500).send("An error occurred while updating the toDo.");
	}
});

app.post("/update/:_id", async (req,res)=>{
	const { title, description, isDone } = req.body;
	const curToDo = new ToDos({
		title, description, isDone
	});
		
	try{
		await ToDos.findOneAndUpdate(
			{ _id: req.params._id },
			{
				title: title,
				description: description,
				isDone: isDone
			}
		);
		const updatedToDo = await ToDos.findById(req.params._id);
		res.send( {message: "Successfully Updated", toDo: updatedToDo} );
	}catch(error){
		console.log("Error while Updating current toDo: ", error.message);
		res.status(500).send("An error occurred while updating the toDo.");
	}
});

app.post("/updatePosition/:_id", async (req,res)=>{
	const { x, y } = req.body;
	const curPos = new ToDos({
		x, y
	});
		
	try{
		await ToDos.findOneAndUpdate(
			{ _id: req.params._id },
			{
				x: x, y: y
			}
		);
		const updatedToDo = await ToDos.findById(req.params._id);
		res.send( {message: "Successfully Updated", toDo: updatedToDo} );
	}catch(error){
		console.log("Error while Updating current toDo's position: ", error.message);
		res.status(500).send("An error occurred while updating the toDo's position.");
	}
})

app.listen(port, () => {
	console.log(`Listening to Port ${port}.`);
});

export { app };