var url = 'https://ricardogithubb.github.io/biblia/';

document.addEventListener("deviceready", iniciar, false);

tempoVisivel = 0;

var corMarcacao = '1, 157, 214';

var gLivro,gCapitulo,gVersiculo;

setIntervalMenu = null;

var alturaLinha = 200;

var baseJSON;

var Version = '1.0.2';

var posFinal = -1;

var contador = 0;

localStorage.setItem('UserId',6165);
var UserId = parseInt(localStorage.getItem('UserId'));

var firstPosition = -1;
var lastPosition = -1;
var alturaCanvas = 0;
var idCanvasInicial = null;
var idCanvasFinal = null;
var paginasLivro = [];
var escala;
      

$.getJSON(url+"dadosJSON.json", function(data) {
      // Função de retorno de chamada que será executada quando o arquivo JSON for carregado com sucesso
      baseJSON = data; // Exibe os dados no console do navegador
});

async function iniciar(){

    screen.orientation.lock('portrait');
  
      // Verifica se o aplicativo possui permissão para usar o reconhecimento de fala
      window.plugins.speechRecognition.hasPermission(function(permission) {
        if (!permission) {  
          window.plugins.speechRecognition.requestPermission(function() {
             // console.log('Permissão concedida para acessar o reconhecimento de fala');
          }, function(error) {
             // console.log('Erro ao solicitar permissão:'+error);
          }); 
        //   $("#modalAlert").modal('show'); 
        }
      }, function(error) {
         // console.log('Erro ao verificar permissão: '+error);
        // $("#modalAlert").modal('show');
      })

  
  }

$(window).on('beforeunload', function() {
    alert('Estou mudando de página');
});

$(document).ready(async function () {

    // Criar um array de objetos JSON vazios
    var livros = {registros: [],titulos: []};

    var registrosFiltrados;

    var pagTitulo;

    var canvaId;

    var acaoClick = 0;

    var livro = '',capitulo = '',versiculo = '';

    var isDrawing = true;
    
    async function mostrarMenu(titulo,tipoLista){

        return new Promise(async (resolve, reject) => {

                localStorage.setItem('voltar',tipoLista);

                var titulos = titulo.split(';');

                // alert(titulos[1]);

                $("#tituloLivro").html(titulos[0]);
                $("#subTituloLivro").html(titulos[1]);
                
                await listarItMenu(tipoLista);

                setTimeout(() => {
                    resolve();
                }, 1000);
                
        })    

    }

    function eliminarDuplicatas(array, campo) {
        const valoresUnicos = new Set();
      
        return array.filter((item) => {
          const valorCampo = item[campo];
      
          if (!valoresUnicos.has(valorCampo)) {
            valoresUnicos.add(valorCampo);
            return true;
          }
      
          return false;
        });
      }

    function listarItMenu(tipoLista){
        return new Promise(async (resolve, reject) => {

            // console.log('tipoLista: '+tipoLista);

            if (tipoLista == 1){

                var estrutura = `<div class="alert alert-light fw-bold fs-5 text-relevo text-center p-1 mx-2" role="alert" id="tituloSup">
                                    O VELHO TESTAMENTO
                                 </div>
                                 <div class="row m-0 px-2">
                                    <div class="col-6 p-0" id="ldEsquerdoVelho"></div>
                                    <div class="col-6 p-0" id="ldDireitoVelho"></div>
                                 </div>
                                 <div class="alert alert-light fw-bold mt-3 fs-5 text-relevo text-center p-1 mx-2" role="alert" id="tituloSup">
                                    O NOVO TESTAMENTO
                                 </div>
                                 <div class="row m-0 px-2">
                                    <div class="col-6 p-0" id="ldEsquerdoNovo"></div>
                                    <div class="col-6 p-0" id="ldDireitoNovo"></div>
                                 </div>`;

                $("section").html(estrutura);

                var bibliaLivros = [];

                var listaEsqVelho = '<div class="col-6 text-start list-menu text-relevo">';
                var listaDirVelho = '<div class="col-6 text-start list-menu text-relevo">';

                var listaEsqNovo = listaEsqVelho;
                var listaDirNovo = listaDirVelho                

                const compararOrdem = (a, b) => a.ordem - b.ordem;

                const titulosOrdenados = livros.registros.slice().sort(compararOrdem);

                // console.log(titulosOrdenados);

                titulosOrdenados.forEach(biblia => {

                
                    if (bibliaLivros.indexOf(biblia.livro) == -1) {
                        bibliaLivros.push(biblia.livro);
                        if(biblia.secao == 'VELHO TESTAMENTO'){
                            if(biblia.coluna == 1){
                                listaEsqVelho += '<span class="badge text-bg-white text-black fsize w-100 text-start my-1 py-1 titulosLivro" value="'+biblia.livro+';'+biblia.titulo+'">'+biblia.livro+'</span>';
                            } else {
                                listaDirVelho += '<span class="badge text-bg-white text-black fsize w-100 text-start my-1 py-1 titulosLivro" value="'+biblia.livro+';'+biblia.titulo+'">'+biblia.livro+'</span>';
                            }
                        } else if(biblia.secao == 'NOVO TESTAMENTO'){
                            if(biblia.coluna == 1){
                                listaEsqNovo += '<span class="badge text-bg-white text-black fsize w-100 text-start my-1 py-1 titulosLivro" value="'+biblia.livro+';'+biblia.titulo+'">'+biblia.livro+'</span>';
                            } else {
                                listaDirNovo += '<span class="badge text-bg-white text-black fsize w-100 text-start my-1 py-1 titulosLivro" value="'+biblia.livro+';'+biblia.titulo+'">'+biblia.livro+'</span>';
                            }

                        }
                                            
                    }
                });

                listaEsqVelho += '</div>';
                listaDirVelho += '</div>';

                listaEsqNovo += '</div>';
                listaDirNovo += '</div>'

                // $("#mEsquerda").html(lista);

                // $("section").html(lista);
                $("#ldEsquerdoVelho").append(listaEsqVelho);
                $("#ldDireitoVelho").append(listaDirVelho);

                
                $("#ldEsquerdoNovo").append(listaEsqNovo);
                $("#ldDireitoNovo").append(listaDirNovo);

                $(".titulosLivro").on('click', async function () {

                    if(acaoClick == 0){
                        
                        acaoClick = 1;

                        $("#btFalar").addClass('d-none');

                        $(this).removeClass('text-black');
    
                        await mostrarMenu($(this).attr('value'),2);

                        acaoClick = 0;

                    }

                });

                $("#fMenu").attr('value','Livros');

                resolve();

            } else if (tipoLista == 2){

                // console.log('Capitulos');

                var livroCapitulos = [];
                var carregaPag = false;
                
                var lista = '<div class="col-6 bg-info text-start list-menu text-relevo">';
                lista += '  <table class="w-100">';

                capitulosFiltrados = eliminarDuplicatas(livros.registros.filter(function(registro) {
                    return removerAcentos(registro.livro) == removerAcentos($("#tituloLivro").html()) 
                }),'capitulo');
                
                var arrayImg = livros.registros.filter(function(registro) {
                    return removerAcentos(registro.livro) == removerAcentos($("#tituloLivro").html()) 
                });

                // console.log(capitulosFiltrados);
                // console.log(capitulosFiltrados.length);

                if(capitulosFiltrados.length == 1){
                    carregaPag = true;
                } else {
                    lista =  await listarCapitulos(capitulosFiltrados,arrayImg);
                }


                lista += '  </table>';
                lista += '</div>';

                // $("#mEsquerda").html(lista);

                // console.log(lista);

                $("section").html(lista);

                $(".titulosCapitulos").on('click', function () {

                    if(acaoClick == 0){
                        
                        acaoClick = 1;

                        var livro = $("#tituloLivro").html();
                        var capitulo = $(this).attr('value');

                        // $(this).removeClass('text-black');
                        $(this).addClass('text-white');

                        localStorage.setItem('voltar',3);

                        localStorage.setItem('livro',livro);                    
                        

                        setTimeout(async () => {
                            $("#btFalar").addClass('d-none');
                            $("section").html('');

                            $acaoVoltar = localStorage.getItem('voltar');
                            localStorage.setItem('voltar',0);

                            await carregarPaginas(livro,capitulo,1);

                            localStorage.setItem('voltar',$acaoVoltar);

                            $("#spinner").addClass('d-none');
                            $("#btFalar").removeClass('d-none');
                            acaoClick = 0;
                        }, 1000);  
                        
                    }

                });

                $("#fMenu").attr('value','Capitulos');

                if(carregaPag){
                    await carregarPaginas(capitulosFiltrados[0].livro,capitulosFiltrados[0].capitulo,1);
                    
                    $("#spinner").addClass('d-none');
                    $("#btFalar").removeClass('d-none');

                } 
                    
                resolve();
            }
        
        })
    }

    $("#lerBiblia").click(function (e) { 
        
        $("#rodape").removeClass('ativo');
        $("#rodape").addClass('inativo');        

        setTimeout(() => {
            location.assign('conteudo.html'); 
        }, 500);
        
    });

    $("#btLouvor").click(function (e) { 
        
        $("#rodape").removeClass('ativo');
        $("#rodape").addClass('inativo');

        setTimeout(() => {
            location.assign('louvores.html'); 
        }, 500);
        
    });

    $("#btMarcacao").click(function (e) { 
        
        $("#rodape").removeClass('ativo');
        $("#rodape").addClass('inativo');

        setTimeout(() => {
            location.assign('marcacoes.html'); 
        }, 500);
        
    });

    $("#btInforme").click(function (e) { 
        
        $("#rodape").removeClass('ativo');
        $("#rodape").addClass('inativo');

        setTimeout(() => {
            location.assign('informe.html'); 
        }, 500);
        
    });

    $("#btVoltar").click(async function (e) { 
        
        if(localStorage.getItem('voltar') == 1){ 
            location.replace('principal.html');
        } else if (localStorage.getItem('voltar') == 2) {
            $("#btFalar").removeClass('d-none');

            $("#modalLoop").modal('show');
            await mostrarMenu('Livros da Bíblia;PRESSIONE O MICROFONE PARA FALAR',1); 
            $("#modalLoop").modal('hide');

        } else if (localStorage.getItem('voltar') == 3) {
            $("#modalLoop").modal('show');
            await mostrarMenu(localStorage.getItem('livro'),2);
            $("#modalLoop").modal('hide');
        }else if (localStorage.getItem('voltar') == 4) {
            
            $("#modalLoop").modal('show');
            localStorage.setItem('voltar', 1);
            setTimeout(() => {
                location.assign('louvores.html'); 
            }, 1000);
            $("#modalLoop").modal('hide');

        }else if (localStorage.getItem('voltar') == 5) {
            
            $("#modalLoop").modal('show');
            localStorage.setItem('voltar', 1);
            setTimeout(() => {
                location.assign('marcacoes.html'); 
            }, 1000);
            $("#modalLoop").modal('hide');

        }
        
    });     


    $("#btFalar").click(async function (e) { 
        
        $("#modalFalar").modal('show');

        $("#btFalar").addClass('d-none');

        // // console.log('1: falarLivro()');

        $("#tituloLivro").html('Bíblia Sagrada');

        await falarLivro();   

        $("#modalFalar").modal('hide');     

        if(livro.length > 0){     
                        
            localStorage.setItem('voltar',2);

            await carregarPaginas(livro,Nvl(capitulo,'1'),Nvl(versiculo,1));


        } else {

            await mostrarMenu("Livros da Bíblia",1);   

        }

        $("#spinner").addClass('d-none');
        $("#btFalar").removeClass('d-none');
        
    });

    // The workerSrc property shall be specified.
    //pdfjsLib.GlobalWorkerOptions.workerSrc = '//mozilla.github.io/pdf.js/build/pdf.worker.js';

    // var pdfDoc = null,
    //     pageNum = 1,
    //     pageRendering = false,
    //     pageNumPending = null,
    //     scale = 10;

    // function renderPage(num) {
    //     return new Promise(async (resolve, reject) => {
    //         pageRendering = true;
    //         // Using promise to fetch the page
    //         pdfDoc.getPage(num).then(async function(page) {
    //             var viewport = page.getViewport({scale: scale});
    //             var cv = document.createElement("canvas");
    //             cv.id = 'canvas_'+canvaId; 
    //             $("section").append(cv);

    //             canvas = document.getElementById('canvas_'+canvaId);
    //             $("#"+'canvas_'+canvaId).attr('data-info', num);
    //             canvas.classList.add('shadow');
    //             canvas.classList.add('canvas-pagina');
    //             canvas.classList.add('border');    
    //             canvas.classList.add('rounded-4');   
                                 
    //             ctx = canvas.getContext('2d')

    //             canvas.height = viewport.height;
    //             canvas.width = viewport.width;

    //             // Render PDF page into canvas context
    //             var renderContext = {
    //             canvasContext: ctx,
    //             viewport: viewport
    //             };
    //             var renderTask = page.render(renderContext);

    //             // Wait for rendering to finish
    //             await renderTask.promise.then(async function() {
    //                 pageRendering = false;
    //                 if (pageNumPending !== null) {
    //                     // New page rendering is pending
    //                     await renderPage(pageNumPending);
    //                     pageNumPending = null;
    //                 } 
    //             });
                
    //             setTimeout(() => {
    //                 canvaId++;
    //                 resolve();
    //             }, 100);
                

    //            // // // console.log('Meio: '+num);                

    //         });

            

    //     })

    // }

    // function queueRenderPage(num) {
    //   if (pageRendering) {
    //     pageNumPending = num;
    //   } else {
    //     renderPage(num);
    //   }
    // }

    function formatarNumeroComZeros(numero, largura) {
        const numeroString = numero.toString();
        if (numeroString.length >= largura) {
          return numeroString;
        } else {
          const zeros = '0'.repeat(largura - numeroString.length);
          return zeros + numeroString;
        }
      }

    function baseDados(){

        return new Promise(async (resolve, reject) => {
       
            // var fileUrl = "Livros da Bíblia.csv";
            var fileUrl2 = "https://ricardogithubb.github.io/biblia/referencias_biblia_img.csv";

            await $.get(fileUrl2, function(data) {
                var lines = data.split("\n");
    
                var output = $("#output");
                output.empty(); // Limpar o conteúdo anterior
    
                lines.forEach(function(line) {
                line = line.replace(/\r/g, "");
                var lineElement = line.split(';');
                    var nome = lineElement[0];
                    var capitulo = lineElement[1];
                    var versiculo_ini = lineElement[2];
                    var versiculo_fin = lineElement[3];
                    var arquivo = lineElement[4];
                    var titulo = lineElement[5];
                    var secao = lineElement[6];
                    var coluna = lineElement[7];
                    var ordem = parseInt(lineElement[8]);
                // Popular o array com vários registros (objetos)
                livros.registros.push({ livro: nome, capitulo: capitulo, versiculo_ini: versiculo_ini, versiculo_fin: versiculo_fin,arquivo: arquivo,titulo: titulo,secao: secao,coluna: coluna,ordem: ordem });
                
                });

                // resolve();

                //   console.log(livros);
            });


            resolve();


        })

    }

    function convertImagePathToBase64(imagePath, callback) {
        return new Promise(function(resolve, reject) {
                var img = new Image();
                img.crossOrigin = 'Anonymous'; // Permitir a carga da imagem de uma origem diferente
                img.onload = function() {
                    var canvas = document.createElement('canvas');
                    var ctx = canvas.getContext('2d');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    ctx.drawImage(img, 0, 0);
                    var dataURL = canvas.toDataURL('image/jpeg'); // Altere para 'image/png' se necessário
                    resolve(dataURL);
                };
                img.src = imagePath;
        })
    }
    
    function verificarExistenciaImagem(nomeImagem) {
        return new Promise(function(resolve, reject) {
            var request = indexedDB.open('biblia', 1);
    
            request.onerror = function(event) {
                console.log('Erro ao abrir o banco de dados:', event.target.errorCode);
                reject(new Error('Erro ao abrir o banco de dados.'));
            };
    
            request.onsuccess = function(event) {
                var db = event.target.result;
                var transaction = db.transaction(['bibliaSagrada'], 'readonly');
                var objectStore = transaction.objectStore('bibliaSagrada');
                var index = objectStore.index('nome_imagem');
    
                var requestGet = index.openCursor(IDBKeyRange.only(nomeImagem));
    
                requestGet.onsuccess = function(event) {
                    var cursor = event.target.result;
                    if (cursor) {
                        // Se o cursor não for nulo, a imagem foi encontrada
                        resolve(1); // Retorna 1 se a imagem existe
                    } else {
                        // Se o cursor for nulo, a imagem não foi encontrada
                        resolve(0); // Retorna 0 se a imagem não existe
                    }
                };
    
                requestGet.onerror = function(event) {
                    console.log('Erro ao verificar a existência da imagem:', event.target.errorCode);
                    reject(new Error('Erro ao verificar a existência da imagem.'));
                };
            };
        });
    }
    

    async function popularTabelaDados() {
        return new Promise(async (resolve, reject) => {
            // Obtém todos os registros de livros
            let registros = livros.registros;
            let totalReg = registros.length;
            // Filtra os registros para remover aqueles com o campo "livro" vazio
            registros = registros.filter(registro => registro.livro !== '');
            // console.log(registros);
            for (let index = 0; index < registros.length; index++) {
                const registro = registros[index];
                // Verifica a existência da imagem
                const regExiste = await verificarExistenciaImagem(registro.arquivo);
                if (!regExiste) {
                    console.log('Gravando registro '+index+' de '+totalReg);
                    var caminhoDaImagem = 'https://ricardogithubb.github.io/biblia/livros/' + removerAcentosInit(registro.livro) + '/' + registro.arquivo;

                    base64image = await convertImagePathToBase64(caminhoDaImagem);              
    
                    var meuVersiculo = {
                        id: index,
                        livro: registro.livro,
                        capitulo: registro.capitulo,
                        versiculo_ini: registro.versiculo_ini,
                        versiculo_fin: registro.versiculo_fin,
                        nome_imagem: registro.arquivo,
                        imagem: base64image,
                        titulo: registro.titulo,
                        parte: registro.secao,
                        ordem: registro.ordem
                    };
                    // Adiciona o versículo apenas se a imagem não existir
                    await adicionarVersiculo(meuVersiculo);
                } else {
                    console.log('Não Gravar.')
                }
            }
            resolve();
        });
    }

    function Titulo(livr,capitulo,vers_ini){


        // console.log('========================================================');
        // console.log('Titulo: '+livr+','+capitulo+','+vers_ini);
        // console.log('========================================================');

        return new Promise(async (resolve, reject) => {
            pagTitulo = livros.registros.filter(function(registro) {
                return registro.livro === livr && registro.capitulo == capitulo && parseInt(registro.versiculo_ini) >= parseInt(vers_ini);
            }); 
             // console.log(pagTitulo.length+' => capitulo:'+capitulo+', versiculo_ini:'+vers_ini);
            
            if(pagTitulo.length > 0){
                var capit = pagTitulo[0].capitulo==0?': ':' '+pagTitulo[0].capitulo+': ';
                var titulo = pagTitulo[0].livro+capit+pagTitulo[0].versiculo_ini+'-'+pagTitulo[pagTitulo.length-1].versiculo_fin;
            }
        
            $("#tituloLivro").html(titulo);
            $("#subTituloLivro").html(pagTitulo[0].titulo);
            
            resolve();
        })
    }

    function removerAcentos(texto) {
        return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    }
    
    function removerAcentosInit(texto) {
        return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    }

    function encontrarLivro(reg,livr,capit,vers){
        return new Promise(async (resolve, reject) => {

            // // console.log('Registros Total: '+reg.length);

            registrosFiltrados = [];

            // // console.log('Num Registros: '+registrosFiltrados.length);

            registrosFiltrados = reg.filter(function(registro) {
                return removerAcentos(registro.livro) == removerAcentos(livr) && 
                       registro.capitulo == capit && 
                       ((parseInt(registro.versiculo_ini) <= parseInt(vers) && 
                         parseInt(registro.versiculo_fin) >= parseInt(vers)) || 
                         parseInt(registro.versiculo_ini) > parseInt(vers));
            });

            // // console.log('Num Registros: '+registrosFiltrados.length);

            if(registrosFiltrados.length > 0){
                await Titulo(registrosFiltrados[0].livro,capit,registrosFiltrados[0].versiculo_ini);
            } else {
                await mostrarMenu('Livros da Bíblia',1);
                // $("#tituloLivro").html('Bíblia Sagrada');
            }           
            
            resolve();

        })
    }


    function pegarPosicoes() {
        return new Promise((resolve, reject) => {
            var contador = 0;
            var intervalo = setInterval(async () => {
                contador++;
                var marcar = -1;
                if (contador === 5 || lastPosition != -1) {
                    clearInterval(intervalo);
                    if(idCanvasInicial != idCanvasFinal){

                        // console.log(paginasLivro);

                        for (let i = 0; i < paginasLivro.length; i++) {
                            const canva = paginasLivro[i];

                            if(canva.pagina === idCanvasInicial){                                    
                                marcar = 1;
                            } else if (canva.pagina === idCanvasFinal) {
                                marcar = 0;
                            }

                            if(marcar === 1){
                                // console.log('marcar === 1: '+idCanvasInicial);
                                alturaCanvas1 = $("#"+canva.pagina).height();
                                lastPosition1 = $("#"+canva.pagina).height()*escala;  
                                marcar = 2;                            
                                await marcador(idCanvasInicial,firstPosition,(lastPosition1-firstPosition+100),alturaCanvas1,1);    
                            } else if (marcar === 2) {
                                // console.log('marcar === 2: '+canva.pagina);
                                alturaCanvas2 = $("#"+canva.pagina).height();   
                                lastPosition2 = $("#"+canva.pagina).height()*escala;                         
                                await marcador(canva.pagina,1,lastPosition2,alturaCanvas2,1); 
                            } else if (marcar === 0) {
                                // console.log('marcar === 0: '+canva.pagina);
                                alturaCanvas0 = $("#"+canva.pagina).height(); 
                                marcar = -1;                          
                                await marcador(canva.pagina,1,lastPosition,alturaCanvas0,1); 
                            }

                            // console.log(canva.pagina+': '+$("#"+canva.pagina).height());
                            
                        };                            

                    } else {
                        if(lastPosition === -1){
                            await marcador(idCanvasInicial,firstPosition,100,alturaCanvas,1); // 1-> Salvar Marcacao
                        } else {
                            await marcador(idCanvasInicial,firstPosition,(lastPosition-firstPosition+100),alturaCanvas,1); // 1-> Salvar Marcacao
                        }
                    }
                    firstPosition = -1;
                    lastPosition = -1;
                    clearInterval(intervalo); // Interrompe o setInterval quando contador for igual a 10
                    resolve(); // Resolve a promessa quando a contagem atinge 10
                }
            }, 1000);
        });
    }


    function carregarLivrosImg(regFilter){
        return new Promise(async (resolve, reject) => {

            
            
            for (let index = 0; index < regFilter.length; index++) { 
                // console.log(regFilter[index].arquivo);
                await CarregaPage(regFilter[index].livro,regFilter[index].arquivo,regFilter[index].versiculo_ini);
                paginasLivro.push({ ordem: (index+1),pagina: regFilter[index].arquivo.replace(/\.png$/, "")});
            }


            $('.canvas-pagina').on('click', async function(e) {

                let canvas = document.getElementById($(this).attr('id'));

                escala = canvas.height/$('#'+$(this).attr('id')).innerHeight();

                // console.log(canvas.height+'/'+$('#'+$(this).attr('id')).innerHeight()+'= '+escala);
                // console.log('Tam. Tela: '+canvas.height);

                var yMouseTela = e.clientY;
            
                // Obter as coordenadas do mouse em relação ao canvas
                var rect = canvas.getBoundingClientRect();
                var yMouseCanvas = yMouseTela - rect.top-10;

                // console.log('yMouseTela: '+yMouseTela);


                if(isDrawing){
                    // console.log('Antes..........');
                    if(firstPosition == -1){
                        firstPosition = (yMouseCanvas*escala)+150;
                        alturaCanvas = canvas.height;
                        idCanvasInicial = $(this).attr('id');
                        idCanvasFinal = idCanvasInicial;
                        await marcador(idCanvasInicial,(yMouseCanvas*escala),150,alturaCanvas,1); // 1-> Salvar Marcacao 
                        piscarImagem('imgLimparPisca');
                        await pegarPosicoes();
                        pararPiscarImagem('imgLimparPisca');
                    } else {
                        lastPosition = (yMouseCanvas*escala);
                        idCanvasFinal = $(this).attr('id');
                    }
                    
                    isDrawing = false; 
                //    await marcador($(this).attr('id'),(yMouseCanvas*escala),alturaLinha,canvas.height,1); // 1-> Salvar Marcacao 
                   isDrawing = true;
                //    console.log('Depois..........');
                }                            

                
            })

            resolve('Loop terminado.');

        })
    }

    async function marcadorold(idCV,posTop,posAltura,tamTela,acao){
        return new Promise(async (resolve, reject) => {

            let canvas = document.getElementById(idCV);
            let ctx = canvas.getContext('2d');

            posInicio = posTop;

            marAltura = posAltura;

            if(acao == 1){

                var posInicio = await checarMarcacao(UserId,idCV,posTop);

                var marAltura = await checarAltura(UserId,idCV,posInicio);
            }

            // console.log('posInicio: '+posInicio);

            var posExist  = await checarExiste(UserId,idCV,posInicio);

            if(acao == 2){
                ctx.fillStyle = 'rgba('+corMarcacao+', 0.200)'; // Cor do retângulo
                ctx.fillRect(0,posInicio, canvas.width, marAltura);
            } else if(marAltura > 0 && posInicio > 0 && posExist == 0){               
            

                ctx.fillStyle = 'rgba('+corMarcacao+', 0.200)'; // Cor do retângulo
                ctx.fillRect(0,posInicio, canvas.width, marAltura);
    
                if(acao == 1){
    
                    await gravarMarcacao(UserId,idCV,posInicio,marAltura,tamTela);
                }

            }
        
            resolve();

        })

    }  
    
    async function marcador(idCV,posTop,posAltura,tamTela,acao){
        return new Promise(async (resolve, reject) => {
            if (posTop < 0) {
                posTop = 0; // Força posTop a ser 0 se for menor que 0
            }

            let canvas = document.getElementById(idCV);
            let ctx = canvas.getContext('2d');

            // console.log('posTop: '+posTop);

            if(acao == 2){
                ctx.fillStyle = 'rgba('+corMarcacao+', 0.200)'; // Cor do retângulo
                ctx.fillRect(0,posTop, canvas.width, posAltura);
            } else if(posAltura > 0 && posTop >= 0 ){               
            

                ctx.fillStyle = 'rgba('+corMarcacao+', 0.200)'; // Cor do retângulo
                ctx.fillRect(0,posTop, canvas.width, posAltura);
    
                if(acao == 1){
    
                    await gravarMarcacao(UserId,idCV,posTop,posAltura,tamTela);
                }

            }
        
            resolve();

        })

    }      

    async function carregarLivros(regFilter,arquivo){

        return new Promise(async (resolve, reject) => {
            pageNum = 0;

            for (let index = 0; index < regFilter.length; index++) {  
                
               // // // console.log(pageNum+' != '+regFilter[index].pagina)

               var porcentagem = (index/regFilter.length)*100

               // // console.log('Carregado: '+porcentagem.toFixed(0)+"%");

                if(pageNum != regFilter[index].pagina){

                    pageNum = parseInt(regFilter[index].pagina);
        
                   // // // console.log('Inicio: '+pageNum);            
                    
                     await carregar(arquivo);
            
                   // // // console.log('Fim: '+pageNum);
                    
                } 

            }

            resolve('Loop terminado.');

        })

    }

  
    function checkCanvasVisibility(capit) {

        return new Promise(async (resolve, reject) => {
            
                var canvasContainers = document.querySelectorAll('.canvas-pagina');

            // // // console.log("Quantidade de Canvas: "+canvasContainers.length);

                var id = 1;

                var retTitulo = false;

                if (canvasContainers.length == 0){
                    resolve();
                } else {

                    canvasContainers.forEach(async function(container, index) {
                        //   var canva = container.querySelector('canvas');
    
                        var canvas = document.getElementById('canvas_'+id++);
    
                        var rect = canvas.getBoundingClientRect();
    
                        // // // console.log(canvas.id+' ->   Altura: '+(rect.bottom/rect.height).toFixed(2));
                        
                        if ((rect.bottom/rect.height).toFixed(2) > 0.20 && !retTitulo){
                            retTitulo = true;
                        // // // console.log('a: '+canvas.id);
                            await Titulo(livro,capit,$("#"+canvas.id).attr("data-info"));
                        // // // console.log($("#"+canvas.id).attr("data-info"));
                            resolve();
                        }                
    
                    });

                }      
                

        })
    }

    function falarLivro(){

        return new Promise((resolve, reject) => {

            $("#textoModal").html('');

            $("section").removeClass('bg-white');

            var options = {
                language: 'pt-BR',
                matches: 1,
                showPopup: false,
                showPartial: false
            };

            livro = '';
            capitulo = '';
            versiculo = '';
            textoFalado = '';

            $("section").html('');

            window.plugins.speechRecognition.startListening(
                async function (fala){
                    var textoFalado = fala;    
                    try {
                            
                            var texto = textoFalado[0]+' ';

                            // alert(texto);

                            await typeWriter(texto, 0);

                            var palavra = '';
                            var indice = 0;
                            var primPalavra;

                            for (let index = 0; index < texto.length; index++) {

                                    if (texto[index] != ' '){
                                        palavra += texto[index]
                                    } else {
                                        
                                        if(indice == 0){primPalavra=palavra}else{primPalavra=primPalavra}

                                        if(indice == 0 || (primPalavra === '1' && indice == 1) 
                                                       || (primPalavra === 'um' && indice == 1) 
                                                       || (primPalavra === 'primeiro' && indice == 1) 
                                                       || (primPalavra === '2' && indice == 1)
                                                       || (primPalavra === 'dois' && indice == 1)
                                                       || (primPalavra === 'segundo' && indice == 1) ){
                            
                                            livro.length == 0? livro = palavra : livro = livro.replace('um','1').replace('primeiro','1').replace('dois','2').replace('segundo','2')+' '+palavra;
                                            
                                            // if(livro.length == 0){
                                            // livro = palavra;
                                        } else if (!isNaN(parseInt(palavra))
                                                        && capitulo.length == 0) {
                                            capitulo = palavra;
                                        } else if (!isNaN(parseInt(palavra))
                                                        && versiculo.length == 0) {
                                            versiculo = palavra;
                                        }
                                        palavra = '';
                                        indice++;

                                    } 
                            }

                            setTimeout(() => {
                                resolve(); 
                            }, 500);
        
                    } catch (error) {

                        livro = '';
                        capitulo = '';
                        versiculo = '';

                        setTimeout(() => {
                            resolve(); 
                        }, 500);
                    }
                        
                }, 
                function (erro){

                    livro = '';
                    capitulo = '';
                    versiculo = '';

                    setTimeout(() => {
                        resolve(); 
                    }, 500);   
                                            
                }, 
            options)

        })

    }

    function typeWriter(text, i) {
        return new Promise((resolve, reject) => {

            if (i < text.length) {
                $("#textoModal").append(text.charAt(i));
                i++;
                setTimeout(async function() {
                    await typeWriter(text, i);
                }, 50); 

                setTimeout(() => {
                    resolve();
                }, 1000);           
                
            } 

        })
    }

    function falarLivroWeb(tipo){

        return new Promise((resolve, reject) => {

            $("section").removeClass('bg-white');
            
            if ('webkitSpeechRecognition' in window) {
                const recognition = new webkitSpeechRecognition();
                recognition.lang = 'pt-BR';

                livro = '';
                capitulo = '';
                versiculo = '';

                $("section").html('');

                recognition.start();

                recognition.onresult = async (event) => {
                    const lastResultIndex = event.results.length - 1;
                    const lastResult = event.results[lastResultIndex];
                    
                    // console.log(lastResult[0].transcript);
                    
                    // $("#textoModal").append("");

                    await typeWriter(lastResult[0].transcript, 0);

                    var pesquisa = lastResult[0].transcript.split(' '); 
                    
                    var primPalavra = pesquisa[0]+"";
                    primPalavra = primPalavra.toLowerCase();

                    // console.log('primPalavra'+primPalavra);

                    if(primPalavra === 'um'){
                        // console.log('É');
                    } else {
                        // console.log('Não é');
                    }
                    
                    for (let index = 0; index < pesquisa.length; index++) {                        
                        
                        if(index == 0 || (primPalavra === 'um' && index == 1) || (primPalavra === 'dois' && index == 1)){
                            
                            livro.length == 0? livro = pesquisa[index] : livro = livro.replace('um','1').replace('dois','2')+' '+pesquisa[index];

                        } else if (!isNaN(parseInt(pesquisa[index]))
                                        && capitulo.length == 0) {
                            capitulo = pesquisa[index];
                            
                        } else if (!isNaN(parseInt(pesquisa[index]))
                                        && versiculo.length == 0) {
                            versiculo = pesquisa[index];
                            
                        }
                        
                    }

                };

                recognition.onend = async () => {                    
                    // console.log('Livro: '+livro);
                    // console.log('capitulo: '+capitulo);
                    // console.log('versiculo: '+versiculo);

                    // // // console.log('2: carregarPaginas()');

                    // $("#eventFalando").addClass('d-none');
                    // $("#eventCarregando").removeClass('d-none');

                    // await carregarPaginas(livro,Nvl(capitulo,'1'),Nvl(versiculo,1));

                    // $("#eventFalando").removeClass('d-none');
                    // $("#eventCarregando").addClass('d-none');

                    // $("#modalFalar").modal('hide');

                    setTimeout(() => {
                       resolve(); 
                    }, 1000);
                    
                };

            }    
        })               

    }

    function CarregaPage(livro,imagem,versic_ini) {
        return new Promise(async (resolve, reject) => {

                let idCanva = imagem.replace(' ','_').split('.')[0];

                // alert(idCanva);

                var cv = document.createElement("canvas");
                cv.id = idCanva;//'canvas_'+canvaId; 
                $("section").append(cv);
                

                canvas = document.getElementById(idCanva);
                $("#"+idCanva).attr('data-info', versic_ini);
                // canvas.classList.add('shadow');
                canvas.classList.add('canvas-pagina');
                canvas.classList.add(idCanva);
                canvas.classList.add('position-relative');    
                // canvas.classList.add('h-50');    
                // canvas.classList.add('border');     
                // canvas.classList.add('border-info');  
                canvas.classList.add('pb-0'); 
                canvas.classList.add('mb-0');
                
                // console.log('canvas_'+canvaId+'  |  '+livro+'  |  '+idCanva);
                                 
                ctx = canvas.getContext('2d');

                // Crie uma nova imagem
                var img = new Image();
                img.src = 'https://ricardogithubb.github.io/biblia/livros/'+removerAcentosInit(livro)+'/'+imagem;

                img.onload = function() {
                    // Define a escala para melhorar a qualidade (por exemplo, escala de 2 para duplicar o tamanho).
                    escala = 2;
                  
                    // Define o tamanho do canvas para o novo tamanho da imagem.
                    canvas.width = img.width * escala;
                    canvas.height = img.height * escala;
                  
                    // Redesenha a imagem no canvas com a nova escala para melhorar a qualidade.
                    ctx.drawImage(img, 0, 0, img.width * escala, img.height * escala);
                  
                    // Opcional: aplique um filtro de suavização (anti-aliasing) para melhorar a qualidade.
                    ctx.imageSmoothingEnabled = true;
                    ctx.imageSmoothingQuality = 'high';
                    ctx.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);
                  
                
                    // console.log('canvas_'+canvaId+'  |  '+livro+'  |  '+imagem+'  |  '+canvas.height);

                    //Gravando o tamanho da tela
                    gravarTela(UserId,imagem,canvas.height);

                    setTimeout(() => {
                        obterMarcacao(idCanva);
                        resolve();
                    }, 100);
                }

                img.onerror = function() {
                    // Ocorreu um erro ao carregar a imagem
                    console.error('Erro ao carregar a imagem');
                    resolve();
                };               
                
            
        })

    }
  
   async function carregarPaginas(livro,capitulo,versiculo){

        gLivro     = livro;
        gCapitulo  = capitulo;
        gVersiculo = versiculo;

        return new Promise(async (resolve, reject) => {

            dadosJSON = {marcacoes: []};
    
            await encontrarLivro(livros.registros,livro,capitulo,versiculo);

            // console.log(registrosFiltrados);

            if(registrosFiltrados.length > 0){

                canvaId = 1;
                
                $("#spinner").removeClass('d-none');

                await carregarLivrosImg(registrosFiltrados);

                setTimeout(() => {

                    dadosJSON.marcacoes.forEach(async function(marcacao) {
                        await marcador(marcacao.pagina,marcacao.posicao,marcacao.altura,null,2);// 2-> Somente Listar
                    })
                    
                }, 2000);
                

                // setTimeout(async () => {
                //     $('#divMenuRight').removeClass('menu-invisivel');
                //     $('#divMenuRight').addClass('menu-visivel');
                //     // tempoVisivel = 0;
                //     // setIntervalMenu = setInterval(ocultarMenuRight, 1000);                    

                //     corMarcacao = await retCorMarcador(UserId);

                //     // await corMarcador(UserId,'100, 157, 214');

                //     var corInicialRGB = 'rgb('+corMarcacao+')';

                //     var corHex = rgbToHex(corInicialRGB);

                //     $('#inputColorMarcador').val(corHex);
                    
                // }, 1000);


            }

            resolve();

        })

   }

   // Função para converter cor RGB para hexadecimal
    function rgbToHex(rgb) {
        // Verifica se a cor está no formato RGB
        var partes = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
        if (!partes) return rgb;
    
        // Converte os valores RGB para hexadecimal e os formata com 2 dígitos
        function componentToHex(c) {
            var hex = c.toString(16);
            return hex.length == 1 ? "0" + hex : hex;
        }
    
        var r = parseInt(partes[1]);
        var g = parseInt(partes[2]);
        var b = parseInt(partes[3]);
    
        // Retorna a cor no formato hexadecimal
        return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
    }

    $("#inputColorMarcador").change(async function (e) { 

        await corMarcadorUpdate(UserId,$(this).val());

        // corMarcacao = await retCorMarcador(UserId);

        $("#btFalar").addClass('d-none');
        $("section").html('');

        await carregarPaginas(gLivro,gCapitulo,gVersiculo);

        $("#spinner").addClass('d-none');
        $("#btFalar").removeClass('d-none');
        
    });


//   $("#btFecharMenu").click(function (e) {
//         $('#divMenuRight').removeClass('menu-visivel');
//         $('#divMenuRight').addClass('menu-invisivel');    
//   });
   

   function Nvl(valor, valorPadrao) {
    return (valor !== null && valor !== undefined && !isNaN(parseInt(valor))) ? valor : valorPadrao;
   }

   // // console.log('0: baseDados()');    
   await baseDados();

//    await popularTabelaDados();
   
   if($('#rodape').length == 1){

        if(baseJSON.atualizar['status']){
            if(baseJSON.atualizar['version'] > Version){
                $(".btAtualizarOff").addClass('d-none');
                $(".btAtualizarOn").removeClass('d-none');
            } else {
                $("#btAtualizarOff").html('V. '+baseJSON.atualizar['version']);
                $(".btAtualizarOff").removeClass('d-none');
                $(".btAtualizarOn").addClass('d-none');
            }
        } else {
            $(".btAtualizarOff").removeClass('d-none');
            $(".btAtualizarOn").addClass('d-none');
        };

        try {
            localStorage.setItem('bannerUnitId',baseJSON.anuncios.bannerUnitId);
            localStorage.setItem('interstitialUnitId',baseJSON.anuncios.interstitialUnitId);            
        } catch (error) {
            localStorage.setItem('bannerUnitId','');
            localStorage.setItem('interstitialUnitId','');
        }

   }

   $("#btAtualizarOn").click(function (e) { 
      
        location.assign('aviso.html');   
        //location.replace(baseJSON.atualizar['link']);
    
   });


   $("#btConfigurar").click(function (e) { 
        
        $("#rodape").removeClass('ativo');
        $("#rodape").addClass('inativo');

        setTimeout(() => {
            location.assign('configurar.html'); 
        }, 500);
        
   });


   $("#btEnviaInforme").click(function (e) { 

        if($('#inputEmail').val().length > 0){
            if($('#inputMessage').val().length > 0){
                whatsapp(baseJSON.parametros['whatsapp'],
                         $('#inputEmail').val(),
                         $('#inputTipo').val(),
                         $('#inputMessage').val());
        
                setTimeout(() => {
                    location.replace('principal.html');
                }, 1000);
            } else { $('#inputMessage').focus(); }
        } else { $('#inputEmail').focus(); }   
    
   });


   if($('#conteudo').length == 1){

     await mostrarMenu('Livros da Bíblia',1);

   }

   if($('#aviso').length == 1){

        $("iframe").attr('src',baseJSON.atualizar['link']);

   }

   if($('#marcacao').length == 1){

       $("#modalLoop").modal('show');

       listMarcacao = await listarMarcacoes(UserId,livros);

    //    console.log('===========================================');
    //    console.log(listMarcacao);
    //    console.log('===========================================');

       let listaMarc = '';

       listaMarc += '<div class="accordion accordion-flush" id="accordionFlushExample">';

       var nomeLivro = '';
       var capLivro = '';
       var tagNomeLivro = '';

       listMarcacao.forEach((registro, index, array) => {
           
        if(nomeLivro != registro.livro){          
            if(nomeLivro.length > 0){
                tagNomeLivro = nomeLivro.replace(/\s/g, '').normalize("NFD").replace(/[\u0300-\u036f]/g, '');
                listaMarc += `<div class="accordion-item bg-transp">
                                    <h2 class="accordion-header bg-transp p-1">
                                        <button class="p-1 text-relevo fw-bold bg-transp accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#${tagNomeLivro}" aria-expanded="false" aria-controls="${tagNomeLivro}">
                                        ${nomeLivro}
                                        </button>
                                    </h2>
                                    <div id="${tagNomeLivro}" class="bg-transp accordion-collapse collapse" data-bs-parent="#accordionFlushExample">
                                        ${capLivro}
                                    </div>
                              </div>`;
                capLivro = '';
            }
            capLivro += `<div class="row m-0 py-0 px-0" id="Livro_${registro.livro.replace(/\s/g, '').normalize("NFD").replace(/[\u0300-\u036f]/g, '')}_Cap${registro.capitulo}">
                            <div class="col-8 overflow-x-auto py-1 d-flex flex-nowrap carregarMarcacao m-0" value="${registro.livro};${registro.capitulo}">
                                <span class="fsizeTLivro listaMarcacao text-relevo fw-bold" id="Rotulo_${registro.livro.replace(/\s/g, '').normalize("NFD").replace(/[\u0300-\u036f]/g, '')}_${registro.capitulo}">Capítulo ${registro.capitulo}</span>
                            </div>
                            <div class="col-2 py-1 m-0 text-center">
                                <span class="fsizeTLivro listaMarcacao text-relevo fw-bold">${registro.porcentagem}</span>
                            </div>
                            <div class="col-2 py-1 m-0 text-center limparMarcador" value="${registro.livro};${registro.capitulo}">
                                <img src="img/limpar-marcacao.png">
                            </div>
                         </div>`;
            nomeLivro = registro.livro;
        } else{
            capLivro += `<div class="row m-0 py-0 px-0" id="Livro_${registro.livro.replace(/\s/g, '').normalize("NFD").replace(/[\u0300-\u036f]/g, '')}_Cap${registro.capitulo}">
                            <div class="col-8 overflow-x-auto py-1 d-flex flex-nowrap carregarMarcacao m-0" value="${registro.livro};${registro.capitulo}">
                                <span class="fsizeTLivro listaMarcacao text-relevo fw-bold" id="Rotulo_${registro.livro.replace(/\s/g, '').normalize("NFD").replace(/[\u0300-\u036f]/g, '')}_${registro.capitulo}">Capítulo ${registro.capitulo}</span>
                            </div>
                            <div class="col-2 py-1 m-0 text-center">
                                <span class="fsizeTLivro listaMarcacao text-relevo fw-bold">${registro.porcentagem}</span>
                            </div>
                            <div class="col-2 py-1 m-0 text-center limparMarcador" value="${registro.livro};${registro.capitulo}">
                                <img src="img/limpar-marcacao.png">
                            </div>
                        </div>`;
        }
        if (index === (array.length - 1)) {
            tagNomeLivro = nomeLivro.replace(/\s/g, '').normalize("NFD").replace(/[\u0300-\u036f]/g, '');
            listaMarc += `<div class="accordion-item bg-transp">
                                <h2 class="accordion-header bg-transp p-1">
                                    <button class="p-1 text-relevo fw-bold bg-transp accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#${tagNomeLivro}" aria-expanded="false" aria-controls="${tagNomeLivro}">
                                    ${nomeLivro}
                                    </button>
                                </h2>
                                <div id="${tagNomeLivro}" class="bg-transp accordion-collapse collapse" data-bs-parent="#accordionFlushExample">
                                    ${capLivro}
                                </div>
                            </div>`;

        }   

       });

    //    console.log(listaMarc);
       $("#divlistMarcacaoes").html(listaMarc);

       $('.carregarMarcacao').on('click', async function(e) {
            var parametr = $(this).attr('value').split(";");
            
            
            $("#btMarcar").addClass('d-none');
            $("#btFalar").addClass('d-none');
            $("section").html('');

            localStorage.setItem('voltar',5);
    
            await carregarPaginas(parametr[0],parametr[1],1);
    
            $("#spinner").addClass('d-none');
            $("#btFalar").removeClass('d-none');

             
            
       })

       $('.limparMarcador').on('click', async function(e) {
            var parametr = $(this).attr('value').split(";");
            
            var idRotulo = "#Rotulo_"+parametr[0].replace(/\s/g, '').normalize("NFD").replace(/[\u0300-\u036f]/g, '')+"_"+parametr[1];
            $("#deleteModalTitulo").html($(idRotulo).html());
            $("#deleteModal").modal('show');

            $("#btLimparMarcacao").off('click');

            $("#btLimparMarcacao").on('click', async function () {
                await limparMarcacao(livros,parametr[0],parametr[1]);
                $("#Livro_"+parametr[0].replace(/\s/g, '').normalize("NFD").replace(/[\u0300-\u036f]/g, '')+"_Cap"+parametr[1]).remove();
                $("#deleteModal").modal('hide');
            });


            
        })       
       
       $("#modalLoop").modal('hide');

   }

   if($('#configurar').length == 1){

        getSizeFont('titulosCapitulos');

   }  

   function checkLoad() {
        return new Promise(async (resolve,reject)=>{

            if (video.readyState === 4) {
                console.log('Carregado');
                $("#divSpinnerVideo").addClass('d-none');
                $("#divLouvor").removeClass('d-none');
            } else if(contador == 150){
                console.log('Erro ao Carregar video');
                // $(".video-mensagem-erro").removeClass('d-none');
                // $(".video-spinner").addClass('d-none');
            } else {
                console.log('Carregando...'+contador);
                contador++;
                setTimeout(checkLoad, 100);
            }
            
        setTimeout(()=>{            
                resolve();
            ;} , 2000
            );
        });  
    }

   function carregarVideo(videoURL){
    return new Promise(async (resolve,reject)=>{

        var source = videoURL;
        
        video.src = source;
        video.load();

        $("#sourceVideo").attr('src', videoURL);
        $("#sourceVideo").attr('type', 'video/mp4');
        
        // $(".text-titulo-video").html(localStorage.getItem('titulo'));
        // $(".text-subtitulo-video").html(localStorage.getItem('subtitulo'));

        contador = 0;
    
        await checkLoad();
            
        setTimeout(()=>{            
                resolve();
            ;} , 2000
            );
        }); 

   }


   if($('#listLouvores').length == 1){

        var listaLouvores = '';

         baseJSON.louvores.titulos.forEach(element => {
            listaLouvores += `<li class="list-group-item bg-ff-transp border-0 d-flex justify-content-between align-items-start liLouvor">
                                    <div class="ms-2 bg-ff-transp border-0 me-auto">
                                    <div class="fw-bold">${element.nome}</div>
                                    <span>${element.cantor}</span>
                                    <span class="d-none">${element.link}</span>                                    
                                    </div>
                                    <span class="badge rounded-pill">
                                    <img src="img/musica-black.png">
                                    </span>
                                 </li>`;
         });
         
         $("#listLouvores").html(listaLouvores);

   }

   $(".liLouvor").click(async function (e) { 
    
      var conteudo = $(this).html();
      var regex = />(.*?)</g;
      var valores = [];
      var match;
      while (match = regex.exec(conteudo)) {
        // O valor real está na posição 1 do array retornado pela execução da regex
        valores.push(match[1]);
      }

      var tituloLouvor = valores[0];
      var contorLouvor = valores[1];
      var link = valores[2];

      if(((link === null || link === undefined)) == false){

         $("#divlistLouvores").addClass('d-none');
         $("#divSpinnerVideo").removeClass('d-none');

         $("#tituloLouvor").html(tituloLouvor);
         $("#contorLouvor").html(contorLouvor);

         localStorage.setItem('voltar', 4);

         await carregarVideo(link);

      }
    
   });


   function whatsapp(phone,pEmail,pTipo,pMessage){
        return new Promise(async (resolve, reject) => {

            var url = 'https://api.whatsapp.com/send?phone='+phone+'&text='; 
                url += '*E-mail:* '+pEmail+'%0a%0a';
                url += '*Tipo:* '+pTipo+'%0a%0a';
                url += '*Mensagem:* '+pMessage+'%0a%0a';
            
            var spaco = url.indexOf(" ");

            while(spaco > 0){

                url = url.replace(" ",'%20');
                spaco = url.indexOf(" ");
            }

            location.href = url;

            resolve();

        })

	}

    var intervaloPiscar;

    function piscarImagem(idImagem) {
        $('#'+idImagem).removeClass('d-none');
        intervaloPiscar = setInterval(function() {
            $('#'+idImagem).fadeToggle(500); // Alterna entre fadeOut e fadeIn
        }, 500);
      }
  
      // Função para parar de piscar
      function pararPiscarImagem(idImagem) {
        $('#'+idImagem).addClass('d-none');
        clearInterval(intervaloPiscar); // Limpa o intervalo
        $('#'+idImagem).fadeIn(500); // Certifique-se de que a imagem esteja visível
      }   


});