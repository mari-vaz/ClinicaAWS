const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();

const MongoClient = require('mongodb').MongoClient;
const url = "mongodb+srv://marilia_vaz:Gato1508@clinica-cloud-sp.ogg4e.mongodb.net/test";
const myDatabase = "odontological-clinic";

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
//----------------------------------

// Resolvendo o CORS em desenvolvimento
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", 'GET,PUT,POST,DELETE');
    app.use(cors());
    next();
});
//----------------------------------
app.get('/', (req,res) => {
	console.log("server de pé.");
	res.send("server de pé.");
});

//>>>>>>>>> Função cadastrarPaciente  <<<<<<<<<<	
app.post('/cadastrarPaciente', (req, res) => { 
	console.log('Got body: ', req.body);		
	let cpfServer = parseInt(req.body.cpf);
	let nomeServer = req.body.nome.toString();
	let nsocialServer = req.body.nsocial.toString();
	let foneServer = parseInt(req.body.fone);
	let nascServer = req.body.nasc.toString();
	let emailServer = req.body.email.toString();
	let endServer = req.body.end.toString();
	
	// transformando a data String em formato Date
	let nascDateFormat = new Date(nascServer);

	// verificando se o paciente já foi cadastrado via email (PK)
	MongoClient.connect(url, function(err, db) {
		if (err) throw err;
		var dbo = db.db(myDatabase);
		dbo.collection("PACIENTES").find({ email: emailServer }).toArray(function(err, result) {
		  if (err) throw err;
		  if(result.length != 0){
			  console.log("Paciente já cadastrado.");
			  res.send("Paciente já cadastrado.");
			  console.log(result);
			  db.close();	
		  } else {
				MongoClient.connect(url, function(err, db) {
					if (err) throw err;
					var dbo = db.db(myDatabase);
			
					//criando objeto JSON
					var myobj = { cpf: cpfServer, nome: nomeServer, nsocial: nsocialServer, fone: foneServer, nasc: nascDateFormat, email: emailServer, end: endServer};
					dbo.collection("PACIENTES").insertOne(myobj, function(err, result) {
					  if (err) throw err;
						  console.log("Paciente cadastrado com sucesso.");
						  res.send("Paciente cadastrado com sucesso.");
						  console.log(result);
						  db.close();	
					 });
				});	
			} // end if-else
		});
	}); // end find()
});
//----------------------------------

//>>>>>>>>> Função inserirConsulta  <<<<<<<<<<
app.post('/inserirConsulta', (req, res) => { 
	console.log('Got body: ', req.body);			
	let cpfServer = parseInt(req.body.cpfPaciente);
	let croServer = req.body.croDentista.toString();
	let dataServer = new Date (req.body.dataConsulta.toString());
	let horaServer = parseInt(req.body.horaConsulta);
	
	// verificando se o paciente já foi cadastrado pelo cpf
	MongoClient.connect(url, function(err, db) {
		if (err) throw err;
		var dbo = db.db(myDatabase);
		dbo.collection("PACIENTES").find({ cpf: cpfServer }).toArray(function(err, result) {
		if (err) throw err;
			if(result.length != 0){	
				// verificando se o dentista já foi cadastrado pelo cro
				MongoClient.connect(url, function(err, db) {
					if (err) throw err;
					var dbo = db.db(myDatabase);
					dbo.collection("DENTISTAS").find({ cro: croServer }).toArray(function(err, result) {
					if (err) throw err;
						if(result.length != 0){
							// inserindo consulta
							MongoClient.connect(url, function(err, db) {
							if (err) throw err;
								var dbo = db.db(myDatabase);
									
								//criando objeto JSON
								var myobj = { cpf: cpfServer, cro: croServer, data: dataServer, horario: horaServer };
								dbo.collection("MARCAR_CONSULTA").insertOne(myobj, function(err, result) {
								if (err) throw err;
								console.log("Consulta marcada com sucesso.");
								res.send("Consulta marcada com sucesso.");
								console.log(result);
								db.close();	
								}); // end of dbo.collection inserir consulta
							});	// end of connect inserir consulta							
						} else {
							console.log("Dentista não encontrado.");
							res.send("Dentista não encontrado. Favor inserir CRO válido.");
						}
						db.close();
					}); // end of dbo.collection ler dentista
				}); // end of connect ler dentista	
			} else {
				console.log("Paciente não cadastrado.");
				res.send("Paciente não cadastrado. Favor cadastrar paciente antes de marcar uma consulta.");		
			}
			db.close();
		}); // end of dbo.collection ler paciente
	}); // end of connect ler paciente
	
	
}); // end of app.post inserirConsulta
//----------------------------------

//>>>>>>>>> Função realizarLogin  <<<<<<<<<<
app.post('/realizarLogin', (req, res) => { 
	console.log('Got body: ', req.body);			
	let codServer = req.body.cod.toString();
	let senhaServer = req.body.senha.toString();
	
	// verificando se o login existe por meio do código (PK)
	MongoClient.connect(url, function(err, db) {
		if (err) throw err;
		var dbo = db.db(myDatabase);
		dbo.collection("REGISTRO_LOGIN").find({ cod: codServer, senha: senhaServer }).toArray(function(err, result) {
		  if (err) throw err;
		  if(result.length != 0){
			  console.log("Login efetuado com sucesso.");
			  res.send("Login efetuado com sucesso.");
			  console.log(result);
			  db.close();	
		  } else {
				console.log("Credenciais inválidas.");
				res.send("Credenciais inválidas.");
				db.close();
			} // end if-else 
		});	
	}); // end connect
}); // fim do app.post realizarLogin
//----------------------------------

//>>>>>>>>> Função consultarFicha  <<<<<<<<<<
app.post('/consultarFicha', (req, res) => { 
	console.log('Got body: ', req.body);			
	let cpfServer = parseInt(req.body.cpf);
	let nomeServer = req.body.nome.toString();
	
	let varBusca;

	if(nomeServer != ''){  
		varBusca = { nome: nomeServer };
	} else {
		varBusca = { cpf: cpfServer };
	} 
	
	MongoClient.connect(url, function(err, db) {
	  if (err) throw err;
	  var dbo = db.db(myDatabase);
		dbo.collection("PACIENTES").find( varBusca ).toArray(function(err, result) {
		console.log("result:"+JSON.stringify(result));
		if (err) throw err;
		if(result.length != 0){
			console.log("Ficha localizada!");
			res.send(result);
		} else {
			console.log("Ficha não localizada.");
			res.send("Ficha não localizada.");
		}
		db.close();
	  }); // end of dbo.collection 
	}); // end of connect editFicha

}); // fim do app.post consultarFicha
//----------------------------------

//>>>>>>>>> Função lerAnamnese  <<<<<<<<<<
app.post('/lerAnamnese', (req, res) => { 
	console.log('Got body: ', req.body);			
	let emailServer = req.body.email.toString();
	
	MongoClient.connect(url, function(err, db) {
	if (err) throw err;
		var dbo = db.db(myDatabase);
		dbo.collection("ANAMNESE").find({ id: emailServer }).toArray(function(err, result) {
		console.log("result:"+JSON.stringify(result));
		if (err) throw err;
		if(result.length != 0){
			console.log("Anamnese localizada!");
			res.send(result);
		} else {
			console.log("Anamnese não localizada.");
			res.send("Anamnese não localizada.");
		}
		db.close();
	  }); // end of dbo.collection 
	}); // end of connect lerAnamnese

});

//>>>>>>>>> Função atualizarAnamnese  <<<<<<<<<<
app.post('/atualizarAnamnese', (req, res) => { 
	console.log('Got body: ', req.body);			
	let alergiaServer = req.body.alergia.toString();
	let fumanteServer = req.body.fumante.toString();
	let emailServer = req.body.email.toString();
	
	MongoClient.connect(url, function(err, db) {
	if (err) throw err;
	  var dbo = db.db(myDatabase);
	  var myquery = { id: emailServer };
	  var newvalues = { $set: { alergia: alergiaServer, fumante: fumanteServer } };
	  
	  if(alergiaServer == ""){
		newvalues = { $set: { fumante: fumanteServer } };		
	  }
	  if(fumanteServer == ""){
		newvalues = { $set: { alergia: alergiaServer } };				
	  }
	  
	  dbo.collection("ANAMNESE").updateOne(myquery, newvalues, function(err, result) {
		if (err) throw err;
		if(result.matchedCount != 0){
			console.log("Anamnese atualizada.");
			res.send("Anamnese atualizada.");			
		} else {
			console.log("Este paciente não possui Anamnese cadastrada.");
			res.send("Este paciente não possui Anamnese cadastrada.");	
		}
		console.log("result: "+JSON.stringify(result));
		db.close();
	}); // end of dbo.collection
	}); // end of connect atualizarAnamnese
}); 
//----------------------------------

//>>>>>>>>> Função cadastrarDentista  <<<<<<<<<<
app.post('/cadastrarDentista', (req, res) => { 
	console.log('Got body: ', req.body);			
	let nomeServer = req.body.nome.toString();
	let nsocialServer = req.body.nsocial.toString();
	let croServer = req.body.cro.toString();
	let especialidadeServer = req.body.especialidade.toString();
	let dispServer = req.body.disp.toString();

	// verificando se o dentista já foi cadastrado via cro (PK)
	MongoClient.connect(url, function(err, db) {
		if (err) throw err;
		var dbo = db.db(myDatabase);
		dbo.collection("DENTISTAS").find({ cro: croServer }).toArray(function(err, result) {
		  if (err) throw err;
		  if(result.length != 0){
			  console.log("Dentista já cadastrado.");
			  res.send("Dentista já cadastrado.");
			  console.log(result);
			  db.close();	
		  } else {
				MongoClient.connect(url, function(err, db) {
					if (err) throw err;
					var dbo = db.db(myDatabase);
			
					//criando objeto JSON
					var myobj = { nome: nomeServer, nsocial: nsocialServer, cro: croServer, especialidade: especialidadeServer, disp: dispServer};
					dbo.collection("DENTISTAS").insertOne(myobj, function(err, result) {
					  if (err) throw err;
						  console.log("Dentista cadastrado com sucesso.");
						  res.send("Dentista cadastrado com sucesso.");
						  console.log(result);
						  db.close();	
					 });
				});	
			} // end if-else
		});
	}); // end find()
	
});
//----------------------------------

//>>>>>>>>> Função cadastrarRecepcionista  <<<<<<<<<<
app.post('/cadastrarRecepcionista', (req, res) => { 
	console.log('Got body: ', req.body);			
	let nomeServer = req.body.nome.toString();
	let codigoServer = parseInt(req.body.codigo);
	let foneServer = parseInt(req.body.fone);
	let emailServer = req.body.email.toString();
	let nsocialServer = req.body.nsocial.toString();
 
	// verificando se o recepcionista já foi cadastrado via código (PK)
	MongoClient.connect(url, function(err, db) {
		if (err) throw err;
		var dbo = db.db(myDatabase);
		dbo.collection("RECEPCIONISTAS").find({ codigo: codigoServer }).toArray(function(err, result) {
		  if (err) throw err;
		  if(result.length != 0){
			  console.log("Recepcionista já cadastrado.");
			  res.send("Recepcionista já cadastrado.");
			  console.log(result);
			  db.close();	
		  } else {
				MongoClient.connect(url, function(err, db) {
					if (err) throw err;
					var dbo = db.db(myDatabase);
			
					//criando objeto JSON
					var myobj = { nome: nomeServer, codigo: codigoServer, fone: foneServer, email: emailServer, nsocial: nsocialServer};
					dbo.collection("RECEPCIONISTAS").insertOne(myobj, function(err, result) {
					  if (err) throw err;
						  console.log("Recepcionista cadastrado com sucesso.");
						  res.send("Recepcionista cadastrado com sucesso.");
						  console.log(result);
						  db.close();	
					 });
				});	
			} // end if-else
		});
	}); // end find()
});

//portas abertas
app.listen(3001, () => {
  console.log('Server launched on port 3001')
}); 
//----------------------------------
