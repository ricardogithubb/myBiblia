document.addEventListener("deviceready", deviceIsReady, false);

var bannerUnitId = localStorage.getItem('bannerUnitId');
var interstitialUnitId = localStorage.getItem('interstitialUnitId');

var interstitialCount = localStorage.getItem('interstitialCount') === null ? 0 : localStorage.getItem('interstitialCount');
localStorage.setItem('interstitialCount',(parseInt(interstitialCount)+1));
async function deviceIsReady(){ 

    await admob.start();

    if(parseInt(localStorage.getItem('banner')) === 0){

        banner = new admob.BannerAd({
            adUnitId: bannerUnitId, 
        }); 
    
        setTimeout(async () => {        
            await banner.show();
        }, 500); 

        localStorage.setItem('banner',1);

    }


    interstitial = new admob.InterstitialAd({
        adUnitId: interstitialUnitId, 
    })

    if(parseInt(localStorage.getItem('interstitialCount')) >= 5){
        localStorage.setItem('interstitialCount',0);       
        setTimeout(async () => {
            await interstitial.load();
            await interstitial.show();            
        }, 1000);
    } 

}