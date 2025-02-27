// const res = require("express/lib/response");

// Abrir ou criar um banco de dados chamado "MeuBancoDeDados"
var request = indexedDB.open('biblia', 1);

// Objeto para armazenar os dados
var dadosJSON = {marcacoes: []};

// Manipular eventos de sucesso e atualização do banco de dados
request.onupgradeneeded = function(event) {
    var db = event.target.result;

    // Criar uma loja de objetos (tabela) chamada "MinhaTabela"
    var objectStore = db.createObjectStore('minhasMarcacoes', { keyPath: 'id' });    
    // Criar índices para as colunas 'nome' e 'idade'
    objectStore.createIndex('iduser', 'iduser', { unique: false });
    objectStore.createIndex('pagina', 'pagina', { unique: false });
    objectStore.createIndex('posicao', 'posicao', { unique: false });
    objectStore.createIndex('altura', 'altura', { unique: false });
    objectStore.createIndex('tela', 'tela', { unique: false });

    
    // Criar uma loja de objetos (tabela) chamada "MinhaTabela"
    var objectStore2 = db.createObjectStore('paginas', { keyPath: 'id' });
    // Criar índices para as colunas 'nome' e 'idade'
    objectStore2.createIndex('iduser', 'iduser', { unique: false });
    objectStore2.createIndex('pagina', 'pagina', { unique: false });
    objectStore2.createIndex('tela', 'tela', { unique: false });

    // Criar uma loja de objetos (tabela) chamada "MinhaTabela"
    var objectStore3 = db.createObjectStore('parametros', { keyPath: 'id' });

    
    // Criar índices para as colunas 'nome' e 'idade'
    objectStore3.createIndex('iduser', 'iduser', { unique: false });
    objectStore3.createIndex('marcacao', 'marcacao', { unique: false });

    // Criar uma loja de objetos (tabela) chamada "MinhaTabela"
    var objectStore4 = db.createObjectStore('versao', { keyPath: 'id', autoIncrement: true });
    
    // Criar índices para as colunas 'nome' e 'idade'
    objectStore4.createIndex('numero', 'numero', { unique: false });

    
    var objectStore5 = db.createObjectStore('bibliaSagrada', { keyPath: 'id' }); 
    objectStore5.createIndex('livro', 'livro', { unique: false });
    objectStore5.createIndex('capitulo', 'capitulo', { unique: false });
    objectStore5.createIndex('versiculo_ini', 'versiculo_ini', { unique: false });
    objectStore5.createIndex('versiculo_fin', 'versiculo_fin', { unique: false });
    objectStore5.createIndex('nome_imagem', 'nome_imagem', { unique: false });
    objectStore5.createIndex('imagem', 'imagem', { unique: false });
    objectStore5.createIndex('titulo', 'titulo', { unique: false });
    objectStore5.createIndex('parte', 'parte', { unique: false });
    objectStore5.createIndex('ordem', 'ordem', { unique: false });
    
};


function adicionarVersiculo(versiculo) {
    return new Promise(async (resolve, reject) => {
        var request = indexedDB.open('biblia', 1);

        request.onerror = function(event) {
            console.log('Erro ao abrir o banco de dados:', event.target.errorCode);
            resolve();
        };

        request.onsuccess = function(event) {
            var db = event.target.result;
            var transaction = db.transaction(['bibliaSagrada'], 'readwrite');
            var objectStore5 = transaction.objectStore('bibliaSagrada');

            var requestAdd = objectStore5.add(versiculo);

            requestAdd.onsuccess = function(event) {
                // console.log('Versículo adicionado com sucesso!');
                resolve();
            };

            requestAdd.onerror = function(event) {
                console.log('Erro ao adicionar o versículo:', event.target.errorCode);
                resolve();
            };
        };
    })

}



function checarExiste(pidUser,pPagina,pPosicao){

    return new Promise(async (resolve, reject) => {

        let posExist = 0;

        var request = indexedDB.open('biblia', 1);

        request.onsuccess = function(event) {
            var db = event.target.result;
        
            // Iniciar uma transação de leitura na loja de objetos
            var transaction = db.transaction(['minhasMarcacoes'], 'readonly');
        
            // Obter a loja de objetos
            var objectStore = transaction.objectStore('minhasMarcacoes');

            var index = objectStore.index('pagina');
    
            var filtro = IDBKeyRange.only(pPagina);
        
            // Abrir um cursor para percorrer os registros
            var cursorRequest = index.openCursor(filtro);

            // Manipular os resultados do cursor
            cursorRequest.onsuccess = function(event) {
                var cursor = event.target.result;
        
                if (cursor) {

                    if(cursor.value.posicao == pPosicao){
                       posExist = 1;
                    }        
                    // Mover para o próximo registro
                    cursor.continue();
                } else {
                    // O cursor atingiu o final dos registros
                    resolve(posExist);
                }
            };
        
            // Manipular erros
            cursorRequest.onerror = function(event) {
                console.error('Erro ao abrir o cursor:', event.target.error);                
                resolve();
            };
        };

    })
}

function retCorMarcador(pUserID){
    return new Promise(async (resolve, reject) => {

        var request = indexedDB.open('biblia', 1);

        request.onsuccess = async function(event) {
            var db = event.target.result;

            const transaction = db.transaction('parametros', 'readwrite');
            const objectStore = transaction.objectStore('parametros');

            // console.log(pTela);
            // Verificar se o nome já foi salvo
            const index = objectStore.index('iduser');
            const getRequest = index.get(pUserID);

            getRequest.onsuccess = function(event) {
                const existingRecord = event.target.result;

                if (existingRecord) {
                    // O nome já foi salvo
                    corMarcacao = existingRecord.marcacao;
                } 
            };

            getRequest.onerror = function(event) {
                reject(event.target.error);
            };

            transaction.oncomplete = function() {
                // console.log('Transação concluída com sucesso.');
                resolve(corMarcacao);
            };

            transaction.onerror = function(event) {
                reject(event.target.error);
            };
        }
    })
    
}

function corMarcadorUpdate(pidUser,pCor){

    return new Promise(async (resolve, reject) => {
    
            var request = indexedDB.open('biblia', 1);
            var db;

            pCor = pCor.replace(/^#/, '');

            // Divide a cor em componentes RGB
            var r = parseInt(pCor.substring(0, 2), 16);
            var g = parseInt(pCor.substring(2, 4), 16);
            var b = parseInt(pCor.substring(4, 6), 16);

            
            var novaCor = r + ', ' + g + ', ' + b;

            // Retorna a cor no formato RGB
            // return 'rgb(' + r + ', ' + g + ', ' + b + ')';

            // Evento acionado quando o banco de dados é aberto com sucesso
            request.onsuccess = function(event) {
                db = event.target.result;
                
                // Iniciar uma transação de leitura e gravação
                var transaction = db.transaction(['parametros'], 'readwrite');
                var objectStore = transaction.objectStore('parametros');
                
                // Procurar o registro que você deseja atualizar
                var getRequest = objectStore.get(pidUser);

                getRequest.onsuccess = function(event) {
                    // Obter o registro
                    var data = event.target.result;

                    // Atualizar os dados
                    data.marcacao = novaCor;

                    // Armazenar o registro atualizado de volta no banco de dados
                    var updateRequest = objectStore.put(data);

                    updateRequest.onsuccess = function(event) {
                        console.log('Registro atualizado com sucesso');
                        resolve();
                    };

                    updateRequest.onerror = function(event) {
                        console.error('Erro ao atualizar registro', event.target.error);
                        resolve();
                    };
                };

                getRequest.onerror = function(event) {
                    console.error('Erro ao obter registro', event.target.error);
                    resolve();
                };
            };

            // Evento acionado se houver um erro ao abrir o banco de dados
            request.onerror = function(event) {
                console.error('Erro ao abrir o banco de dados', event.target.error);
                resolve();
            };
    })

}

function corMarcador(pidUser,pCor){

    return new Promise(async (resolve, reject) => {

        var request = indexedDB.open('biblia', 1);     
        
        request.onsuccess = async function(event) {
            var db = event.target.result;

            // Iniciar uma transação de leitura/gravação na loja de objetos
            transaction = db.transaction(['parametros'], 'readwrite');
                
            // Obter a loja de objetos
            var objectStore = transaction.objectStore('parametros');
                
            // Adicionar um objeto à loja com três campos
            objectStore.add({id: pidUser, iduser: pidUser, marcacao: pCor});
            
            // Encerrar a transação
            transaction.oncomplete = function() {
                console.log('Dado gravado com sucesso.');
                resolve();
            };

        };

        request.onerror = function(event) {
            console.error('Erro ao abrir o banco de dados:', event.target.error);
            resolve();
        };

    })
}

function checarMarcacao(pidUser,pPagina,pPosicao){

    return new Promise(async (resolve, reject) => {

        let posArray = [];

        var request = indexedDB.open('biblia', 1);

        request.onsuccess = function(event) {
            var db = event.target.result;

            let posInicio = pPosicao;
            let posAte    = 100;
        
            // Iniciar uma transação de leitura na loja de objetos
            var transaction = db.transaction(['minhasMarcacoes'], 'readonly');
        
            // Obter a loja de objetos
            var objectStore = transaction.objectStore('minhasMarcacoes');

            var index = objectStore.index('pagina');
    
            var filtro = IDBKeyRange.only(pPagina);
        
            // Abrir um cursor para percorrer os registros
            var cursorRequest = index.openCursor(filtro);

            // Manipular os resultados do cursor
            cursorRequest.onsuccess = function(event) {
                var cursor = event.target.result;
        
                if (cursor) {

                    posArray.push(cursor.value.posicao);

                    // if((cursor.value.posicao+100) > pPosicao && (cursor.value.posicao+100) < pPosicao+100){
                    //     posInicio = cursor.value.posicao+100;
                    // }
        
                    // Mover para o próximo registro
                    cursor.continue();
                } else {
                    // O cursor atingiu o final dos registros
                    // console.log('Todos os registros foram lidos.');
                    // console.log('posInicio: '+posInicio);
                    posArray.sort((a, b) => a - b);

                    posArray.forEach(function(posicao) {
                        if((posicao+100) > pPosicao && (posicao+100) < pPosicao+100){
                            posInicio = posicao+100;
                        }
                    });

                    resolve(posInicio);
                    ;
                }
            };
        
            // Manipular erros
            cursorRequest.onerror = function(event) {
                console.error('Erro ao abrir o cursor:', event.target.error);                
                resolve();
            };
        };

    })
}

function checarAltura(pidUser,pPagina,pPosicao){

    return new Promise(async (resolve, reject) => {

        var request = indexedDB.open('biblia', 1);

        let altArray = [];
        let minhaTabela = [];

        request.onsuccess = function(event) {
            var db = event.target.result;

            let Altura = 100;
        
            // Iniciar uma transação de leitura na loja de objetos
            var transaction = db.transaction(['minhasMarcacoes'], 'readonly');
        
            // Obter a loja de objetos
            var objectStore = transaction.objectStore('minhasMarcacoes');

            var index = objectStore.index('pagina');
    
            var filtro = IDBKeyRange.only(pPagina);
        
            // Abrir um cursor para percorrer os registros
            var cursorRequest = index.openCursor(filtro);

            // Manipular os resultados do cursor
            cursorRequest.onsuccess = function(event) {
                var cursor = event.target.result;
        
                if (cursor) {

                    altArray.push(cursor.value.posicao);

                    minhaTabela.push([cursor.value.posicao,cursor.value.posicao+cursor.value.altura]);
        
                    // Mover para o próximo registro
                    cursor.continue();
                } else {
                    // Retorna a altura

                    minhaTabela.sort(function (a, b) {
                        return a[0] - b[0];
                    });

                    // console.log(minhaTabela);
                    
                    altArray.sort((a, b) => a - b);

                    altArray.forEach(function(posicao) {
                        if((pPosicao+100) > posicao && pPosicao < posicao){
                            Altura = posicao-(pPosicao);
                        } 
                        
                        if (pPosicao == posicao) {                            
                            Altura = 0;                            
                        }
                    });

                    resolve(Altura);

                }
            };
        
            // Manipular erros
            cursorRequest.onerror = function(event) {
                console.error('Erro ao abrir o cursor:', event.target.error);                
                resolve();
            };
        };

    })
}

function gravarMarcacao(pidUser,pPagina,pPosicao,pAltura,pTamTela){

    return new Promise(async (resolve, reject) => {

        var request = indexedDB.open('biblia', 1);     
        
        request.onsuccess = async function(event) {
            var db = event.target.result;

            let regId = 0;

            let transaction;

            // Iniciar uma transação de leitura na loja de objetos
            transaction = db.transaction(['minhasMarcacoes'], 'readonly');

            // Obter a loja de objetos
            var objectStore = transaction.objectStore('minhasMarcacoes');

            // Abrir um cursor para contar o número de registros
            var countRequest = objectStore.count();

            // Manipular o sucesso da contagem
            countRequest.onsuccess = function() {
                regId = countRequest.result+1;
                // console.log('Número de registros: ' + regId);
            };

        await setTimeout(() => {
                
                if(regId != 0){

                    // Iniciar uma transação de leitura/gravação na loja de objetos
                    transaction = db.transaction(['minhasMarcacoes'], 'readwrite');
                
                    // Obter a loja de objetos
                    var objectStore = transaction.objectStore('minhasMarcacoes');
                
                    // Adicionar um objeto à loja com três campos
                    objectStore.add({ id: regId, iduser: pidUser, pagina: pPagina, posicao: pPosicao, altura: pAltura, tela: pTamTela });
            
                    // Encerrar a transação
                    transaction.oncomplete = function() {
                        // console.log('Dado gravado com sucesso.');
                        resolve();
                    };

                }
                
            }, 500);
        };

        request.onerror = function(event) {
            console.error('Erro ao abrir o banco de dados:', event.target.error);
            resolve();
        };

    })

}

  // Função para verificar e salvar o nome
function gravarTela(pidUser,pPagina,pTamanho) {

    return new Promise((resolve, reject) => {

        var request = indexedDB.open('biblia', 1);     
        
        request.onsuccess = async function(event) {
            var db = event.target.result;
      
            var regId = 0;

            const transaction = db.transaction('paginas', 'readwrite');
            const objectStore = transaction.objectStore('paginas');

            // Abrir um cursor para contar o número de registros
            var countRequest = objectStore.count();

            // Manipular o sucesso da contagem
            countRequest.onsuccess = function() {
                regId = countRequest.result+1;
                // console.log('Número de registros: ' + regId);
            };

            // Verificar se o nome já foi salvo
            const index = objectStore.index('pagina');
            const getRequest = index.get(pPagina);

            getRequest.onsuccess = function(event) {
                const existingRecord = event.target.result;

                if (existingRecord) {
                // O nome já foi salvo
                resolve(existingRecord);
                } else {
                // Salvar o nome se não existir
                const addRequest = objectStore.add({ id: regId, iduser: pidUser, pagina: pPagina, tela: pTamanho });

                addRequest.onsuccess = function() {
                    resolve({ pagina: pPagina });
                };

                addRequest.onerror = function(event) {
                    reject(event.target.error);
                };
                }
            };

            getRequest.onerror = function(event) {
                reject(event.target.error);
            };

            transaction.oncomplete = function() {
                console.log('Transação concluída com sucesso.');
            };

            transaction.onerror = function(event) {
                reject(event.target.error);
            };
        }
    });
}

function limparMarcacao(arrayLivros,pLivro,pCapitulo){

    var deleteMarcacao = arrayLivros.registros.filter(function(reg) {
        return reg.livro == pLivro && reg.capitulo == pCapitulo 
    });  


    return new Promise(async (resolve, reject) => {

        request.onerror = function(event) {
            console.log("Erro ao abrir o banco de dados:", event.target.errorCode);
        };

        var deletePromises = [];

        deleteMarcacao.forEach(registro => {
            var pagina = registro.arquivo.replace(/\.png$/, "");
            var request = indexedDB.open('biblia', 1);

            request.onsuccess = function(event) {
                var db = event.target.result;
            
                // Iniciar uma transação de leitura na loja de objetos
                var transaction = db.transaction(['minhasMarcacoes'], 'readwrite');
            
                // Obter a loja de objetos
                var objectStore = transaction.objectStore('minhasMarcacoes');
            
                var index = objectStore.index("pagina");
                var keyRange = IDBKeyRange.only(pagina);
                // console.log(pagina);
                // Retorna uma promessa que resolve após a exclusão do registro
                deletePromises.push(new Promise(function(resolve, reject) {
                    index.openCursor(keyRange).onsuccess = function(event) {
                        var cursor = event.target.result;
                        if (cursor) {
                            cursor.delete();
                            cursor.continue();
                        } else {
                            resolve(); // Resolve a promessa quando a exclusão é concluída
                        }
                    };
                }));
            };
        });

        // Aguarda todas as promessas de exclusão serem resolvidas antes de executar o console.log
        Promise.all(deletePromises).then(function() {
            // console.log('Teste............');
            resolve();
        }).catch(function(error) {
            console.error('Erro durante a exclusão:', error);
        });


    })
}

function listarMarcacoes(pUser,arryLivros){
    
    // console.log(arryLivros.registros);

    return new Promise((resolve, reject) => {

        var request = indexedDB.open('biblia', 1);

        var linhaMarcacao = '';

        request.onsuccess = function(event) {
            var db = event.target.result;
        
            // Iniciar uma transação de leitura na loja de objetos
            var transaction = db.transaction(['minhasMarcacoes'], 'readonly');
        
            // Obter a loja de objetos
            var objectStore = transaction.objectStore('minhasMarcacoes');

            var index = objectStore.index('iduser');
    
            var filtro = IDBKeyRange.only(pUser);
        
            // Abrir um cursor para percorrer os registros
            var cursorRequest = index.openCursor(filtro);

            // Manipular os resultados do cursor
            cursorRequest.onsuccess = async function(event) {
                var cursor = event.target.result;
        
                if (cursor) {
                    // O cursor aponta para um registro, você pode acessar os dados assim:
                    var data = cursor.value;
                    
                    var pag = data.pagina;

                    var arrayImg = arryLivros.registros.filter(function(registro) {
                        return registro.arquivo == pag+'.png'; 
                    });

                    if(arrayImg.length > 0){
                        // console.log('Pagina: ' + data.pagina + ', Posicao: ' + data.posicao);
                        var novoRegistro = { ordem: parseInt(arrayImg[0].ordem),livro: arrayImg[0].livro, capitulo: parseInt(arrayImg[0].capitulo),porcentagem: 0 };
    
                        // Verifica se já existe um registro com os mesmos valores de livro e capitulo
                        var indiceRegistroExistente = dadosJSON.marcacoes.findIndex(function(registro) {
                            return registro.livro === novoRegistro.livro && registro.capitulo === novoRegistro.capitulo;
                        });
                        
                        if (indiceRegistroExistente === -1) {
                            // Adiciona o novo registro ao array se não existir
                            dadosJSON.marcacoes.push(novoRegistro);
    
                            dadosJSON.marcacoes.sort((a, b) => {
                                // Primeiro, ordena pelo campo 'ordem'
                                if (a.ordem !== b.ordem) {
                                    return a.ordem - b.ordem;
                                }
                                // Se 'ordem' for igual, então ordena pelo campo 'capitulo'
                                return a.capitulo - b.capitulo;
                            });
    
                            // console.log(dadosJSON.marcacoes);
                            console.log("Registro adicionado com sucesso.");
                        }

                    }

                    // dadosJSON.marcacoes.push({ livro: arrayImg[0].livro, capitulo: arrayImg[0].capitulo });
        
                    // Mover para o próximo registro
                    cursor.continue();
                } else {
                    // O cursor atingiu o final dos registros
                    // console.log('Todos os registros foram lidos.');
                    
                    var listaMarc = ''; 
                    
                    dadosJSON.marcacoes.forEach(async function(registro, indice) {
                        // console.log(registro);                        
                        var livrCapitulos = await arryLivros.registros.filter(function(reg) {
                            return reg.livro == registro.livro && reg.capitulo == registro.capitulo 
                        });
                        let livros = {registros: []};
                        livros.registros.push(livrCapitulos); 

                        let porcTotal = await porcConcluida(livros,registro.livro,registro.capitulo);
                        dadosJSON.marcacoes[indice].porcentagem = porcTotal; 
                        // console.log(porcTotal);
                        // listaMarc += `<div class="row m-0 py-0 px-0" id="Livro_${registro.livro.replace(/\s/g, '').normalize("NFD").replace(/[\u0300-\u036f]/g, '')}_Cap${registro.capitulo}">
                        //                     <div class="col-8 overflow-x-auto py-1 d-flex flex-nowrap carregarMarcacao m-0" value="${registro.livro};${registro.capitulo}">
                        //                         <span class="fsizeTLivro listaMarcacao text-relevo fw-bold">${registro.livro} / Cap. ${registro.capitulo}</span>
                        //                     </div>
                        //                     <div class="col-2 py-1 m-0 text-center">
                        //                         <span class="fsizeTLivro listaMarcacao text-relevo fw-bold">${porcTotal}</span>
                        //                     </div>
                        //                     <div class="col-2 py-1 m-0 text-center limparMarcador" value="${registro.livro};${registro.capitulo}">
                        //                         <img src="img/limpar-marcacao.png">
                        //                     </div>
                        //               </div>`;
                        
                    })
                    
                    setTimeout(() => {
                        // console.log(dadosJSON.marcacoes);
                        resolve(dadosJSON.marcacoes);                        
                    }, 2000);
                }
            };
        
            // Manipular erros
            cursorRequest.onerror = function(event) {
                console.error('Erro ao abrir o cursor:', event.target.error);                
                resolve(dadosJSON);
            };
        };

    })   
}

function listarCapitulos(arrCapitulos,livr){

    return new Promise(async (resolve) => {

        let lista = '';

        let livros = {registros: []};

        livros.registros.push(livr);

        for (let index = 0; index < arrCapitulos.length; index++) {
            
            const biblia = arrCapitulos[index];

            // console.log('Capitulo: '+biblia.capitulo);                    
            var versiculos = livros.registros[0].filter(function(registro) {
                return registro.livro === $("#tituloLivro").html() && registro.capitulo == biblia.capitulo;
            });


            let porcTotal = await porcConcluida(livros,biblia.livro,biblia.capitulo);
            
            lista += '<tr>';
            lista += '  <td>';
            lista += '      <span class="badge text-bg-white text-relevo fsizeTCapitulo w-100 text-start my-1 py-1 titulosCapitulos" value="'+biblia.capitulo+'">Capítulo: '+biblia.capitulo+'  '+versiculos[0].versiculo_ini+':'+versiculos[versiculos.length-1].versiculo_fin+'</span>';                                           
            lista += '  </td>';
            lista += '  <td>';
            lista += '      <span class="badge text-bg-white text-black-50 fsizeTCapitulo w-100 text-start my-1 py-1 titulosCapitulos">    </span>';                                           
            lista += '  </td">';
            lista += '  <td>';
            lista += '      <span class="badge text-bg-white text-black-50 fsizeTCapitulo w-100 text-start my-1 py-1 titulosCapitulos">    </span>';                                           
            lista += '  </td">';
            lista += '  <td>';
            lista += '      <span class="badge text-bg-white text-black-50 fsizeTCapitulo w-100 text-start my-1 py-1 titulosCapitulos">    </span>';                                           
            lista += '  </td">';
            lista += '  <td>';
            lista += '      <span class="badge text-bg-white text-black-50 fsizeTCapitulo w-100 text-start my-1 py-1 titulosCapitulos">'+porcTotal+'</span>';                                           
            lista += '  </td">';
            lista += '</tr">';
        }

        resolve(lista);
        

    })
}

function totalTela(pTela){
    return new Promise(async (resolve, reject) => {

        var request = indexedDB.open('biblia', 1);

        var tamTela = 0;

        request.onsuccess = async function(event) {
            var db = event.target.result;

            const transaction = db.transaction('paginas', 'readwrite');
            const objectStore = transaction.objectStore('paginas');

            // console.log(pTela);
            // Verificar se o nome já foi salvo
            const index = objectStore.index('pagina');
            const getRequest = index.get(pTela);

            getRequest.onsuccess = function(event) {
                const existingRecord = event.target.result;

                if (existingRecord) {
                    // O nome já foi salvo
                    tamTela += existingRecord.tela;
                } 
            };

            getRequest.onerror = function(event) {
                reject(event.target.error);
            };

            transaction.oncomplete = function() {
                // console.log('Transação concluída com sucesso.');
                resolve(tamTela);
            };

            transaction.onerror = function(event) {
                reject(event.target.error);
            };
        }
    })
}

function porcConcluida(arrLivros,pLivro,pCapitulo){
    // console.log('==========================================================');
    // console.log(arrLivros.registros[0]);
    return new Promise(async (resolve, reject) => {
        setTimeout(async () => {

            let totTela = 0;

            let totMarc = 0;

            var arrPaginas = arrLivros.registros[0].filter(function(registro) {
                return registro.capitulo == pCapitulo;
            });

            // console.log(arrPaginas.length);

              

            for (let index = 0; index < arrPaginas.length; index++) {
                const pagina = arrPaginas[index];                
        
                totTela += await totalTela(pagina.arquivo);

                totMarc += await totalMarcacao(pagina.arquivo);
                
            }

            // console.log('totTela: '+totTela);
            // console.log('totMarc: '+totMarc);

            if(totMarc > 0){
                porcVisto = (totMarc/totTela)*100;
                // Limita o valor de porcVisto a no máximo 100
                porcVisto = Math.min(porcVisto, 100);
            } else {
                porcVisto = 0;
            }

            // console.log('porcVisto: '+porcVisto.toFixed(0)+'%');

            resolve(porcVisto.toFixed(0)+'%');            

        }, 10);
    })
}


function obterMarcacao(pPagina){
    return new Promise(async (resolve, reject) => {

        var request = indexedDB.open('biblia', 1);

        request.onsuccess = function(event) {
            var db = event.target.result;
        
            // Iniciar uma transação de leitura na loja de objetos
            var transaction = db.transaction(['minhasMarcacoes'], 'readonly');
        
            // Obter a loja de objetos
            var objectStore = transaction.objectStore('minhasMarcacoes');

            var index = objectStore.index('pagina');
    
            var filtro = IDBKeyRange.only(pPagina);
        
            // Abrir um cursor para percorrer os registros
            var cursorRequest = index.openCursor(filtro);

            // Manipular os resultados do cursor
            cursorRequest.onsuccess = function(event) {
                var cursor = event.target.result;
        
                if (cursor) {
                    // O cursor aponta para um registro, você pode acessar os dados assim:
                    var data = cursor.value;
                    // console.log('Pagina: ' + data.pagina + ', Posicao: ' + data.posicao);
                    dadosJSON.marcacoes.push({ pagina: data.pagina, posicao: data.posicao, altura: data.altura  });
        
                    // Mover para o próximo registro
                    cursor.continue();
                } else {
                    // O cursor atingiu o final dos registros
                    // console.log('Todos os registros foram lidos.');
                    resolve();
                }
            };
        
            // Manipular erros
            cursorRequest.onerror = function(event) {
                console.error('Erro ao abrir o cursor:', event.target.error);                
                resolve();
            };
        };

    })
}

function getSizeFont(elemento){
    var tamanhoFonte = $('.'+elemento).css('font-size');

    // console.log('tamanhoFonte: '+tamanhoFonte);
}


function totalMarcacao(pPagina){
    return new Promise(async (resolve, reject) => {

        var request = indexedDB.open('biblia', 1);

        request.onsuccess = function(event) {
            var db = event.target.result;
        
            // Iniciar uma transação de leitura na loja de objetos
            var transaction = db.transaction(['minhasMarcacoes'], 'readonly');
        
            // Obter a loja de objetos
            var objectStore = transaction.objectStore('minhasMarcacoes');

            var index = objectStore.index('pagina');
    
            var filtro = IDBKeyRange.only(pPagina.split('.').slice(0, -1).join('.'));
        
            // Abrir um cursor para percorrer os registros
            var cursorRequest = index.openCursor(filtro);

            let totalMarc = 0;

            // console.log("=================================================================");
            // console.log('pPagina: '+pPagina.split('.').slice(0, -1).join('.'));

            // Manipular os resultados do cursor
            cursorRequest.onsuccess = function(event) {
                var cursor = event.target.result;
        
                if (cursor) {
                    // O cursor aponta para um registro, você pode acessar os dados assim:
                    var data = cursor.value;
                    
                    totalMarc += data.altura;
                    // Mover para o próximo registro
                    cursor.continue();
                } else {
                    // O cursor atingiu o final dos registros
                    // console.log('Todos os registros foram lidos.');
                    resolve(totalMarc);
                }
            };

            // console.log("=================================================================");
        
            // Manipular erros
            cursorRequest.onerror = function(event) {
                // console.error('Erro ao abrir o cursor:', event.target.error);                
                resolve(0);
            };
        };

    })
}



