/* Dated U.S. buyer samples for a planning estimate. These are not a national survey. */
(function(){
  'use strict';
  var DATE='2026-09-29';
  var BOARD_SORT='https://boardsort.com/payout.php';
  var JRS='https://jrsadvancedrecyclers.com/scrap-metal-prices/';
  var DATA={
    board_high:{label:'High grade circuit boards',price:3.20,samples:[{buyer:"J.R.'s Advanced Recyclers",price:3.20,url:JRS,category:'High Grade/Apop'}]},
    board_mid:{label:'Mid grade circuit boards',price:0.65,samples:[{buyer:'BoardSort',price:0.60,url:BOARD_SORT,category:'Mid Grade Board'},{buyer:"J.R.'s Advanced Recyclers",price:0.70,url:JRS,category:'Mid Grade/Bpop'}]},
    board_low:{label:'Low grade circuit boards',price:0.43,samples:[{buyer:'BoardSort',price:0.60,url:BOARD_SORT,category:'Low Grade'},{buyer:"J.R.'s Advanced Recyclers",price:0.25,url:JRS,category:'Low Grade Circuit Boards'}]},
    cell_phone_boards:{label:'Clean cell phone boards',price:22.50,samples:[{buyer:'BoardSort',price:22.50,url:BOARD_SORT,category:'Cell Phone Boards'}]}
  };
  function get(id){
    var item=DATA[id];if(!item)return null;
    var age=(Date.now()-Date.parse(DATE+'T00:00:00Z'))/86400000;
    return {id:id,label:item.label,price:item.price,unit:'lb',date:DATE,stale:age>30,
      samples:item.samples.map(function(x){return {buyer:x.buyer,price:x.price,url:x.url,category:x.category}})};
  }
  window.ScrapRadarBoardPriceReference={get:get,asOf:DATE};
})();
