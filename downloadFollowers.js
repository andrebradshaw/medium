var reg = (o, n) => o ? o[n] : '';
var cn = (o, s) => o ? o.getElementsByClassName(s) : console.log(o);
var tn = (o, s) => o ? o.getElementsByTagName(s) : console.log(o);
var gi = (o, s) => o ? o.getElementById(s) : console.log(o);
var rando = (n) => Math.round(Math.random() * n);
var delay = (ms) => new Promise(res => setTimeout(res, ms));
var unq = (arr) => arr.filter((e, p, a) => a.indexOf(e) == p);
var delay = (ms) => new Promise(res => setTimeout(res, ms));
var ele = (t) => document.createElement(t);
var attr = (o, k, v) => o.setAttribute(k, v);
 
async function getFollowers(user,nextid,offset){
  var res = await fetch("https://medium.com/_/api/users/"+user+"/profile/stream?limit=25&to="+nextid+"&source=followers&page="+offset, {"credentials":"include","headers":{"accept":"application/json","accept-language":"en-US,en;q=0.9","content-type":"application/json","x-client-date":"1563908795737","x-obvious-cid":"web","x-xsrf-token":"1"},"referrer":"https://medium.com/@jfpetersphoto/followers","referrerPolicy":"unsafe-url","body":null,"method":"GET","mode":"cors"});
  var text = await res.text();
  var d = JSON.parse(text.replace(/.+?<\/x>/, ''));
  console.log(d)
  return d;
}
 
// getFollowers('54fa451f60ac','107381cdec11',1)
 
 
  function downloadr(arr2D, filename) {
    var data = /\.json$|.js$/.test(filename) ? JSON.stringify(arr2D) : arr2D.map(el => el.reduce((a, b) => a + '\t' + b)).reduce((a, b) => a + '\r' + b);
    var type = /\.json$|.js$/.test(filename) ? 'data:application/json;charset=utf-8,' : 'data:text/plain;charset=utf-8,';
    var file = new Blob([data], {
      type: type
    });
    if (window.navigator.msSaveOrOpenBlob) {
      window.navigator.msSaveOrOpenBlob(file, filename);
    } else {
      var a = document.createElement('a'),
        url = URL.createObjectURL(file);
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }, 10);
    }
  }
 
var dateifdate = (s) => {if((typeof s == "number" || typeof s == "string") && /\b1[1-6]\d{11}\b/.test(s.toString())) {return new Date(s);}else{ return s;}};
 
function convertToTSV(fileArray) {
  var firstLevel = fileArray.map(el => Object.entries(el));
  var lens = Math.max(...firstLevel.map(el => el.length));
  var header = unq(firstLevel.map(el => el.map(itm => itm[0])).flat());
  var table = [header];
  var str = (o) => typeof o == 'object' ? JSON.stringify(o).replace(/\n|\r/g, ' ') : o.toString().replace(/\n|\r/g, ' ');
  for (var i = 0; i < firstLevel.length; i++) {
    var arr = [];
    var row = [];
    for (var s = 0; s < firstLevel[i].length; s++) {
      var place = header.indexOf(firstLevel[i][s][0]);
      arr[place] = dateifdate(firstLevel[i][s][1]);
    }
    for (var a = 0; a < arr.length; a++) {
      if (arr[a]) {
        row.push(arr[a]);
      } else {
        row.push('');
      }
    }
    table.push(row);
  }
  var output = table.map(el => el.map(itm => str(itm)));
  return output;
}
 
var startId = Array.from(cn(document,'link u-baseColor--link avatar u-width60 u-marginRight20 u-flex0'))[0].getAttribute('data-user-id');
var targetUser =  cn(cn(document,'uiScale uiScale-ui--large uiScale-caption--regular js-profileHeader')[0],'followState js-followState')[0].getAttribute('data-user-id');
 
async function loopThoughAllFollowers(){
  var containArr = [];
  var loop1 = await getFollowers(targetUser,startId,1);
  var first = Object.entries(loop1.payload.references.User).forEach(el=> containArr.push(el[1]));
  var nextId = loop1.payload.paging.next.to;
  for(var i=2; i<5000; i++){
    var res = await getFollowers(targetUser,nextId,i);
    if(res.payload.references.User){
      nextId = res.payload.paging.next.to;
      var loop = Object.entries(res.payload.references.User).map(el=> el[1]);
      console.log(loop)
      loop.forEach(el=> { if(containArr.every(itm=> itm.userId != el.userId)) containArr.push(el) } );
      if(loop.length < 25) break;
    }else{
      break;
    }
    await delay(rando(222)+1600);
  }
  var output = convertToTSV(containArr);
  downloadr(output, targetUser+'_file.tsv');
}
 
loopThoughAllFollowers()
