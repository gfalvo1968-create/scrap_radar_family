/* Dated U.S. buyer samples for a planning estimate. These are not a national survey. */
(function(){
  'use strict';
  var DATE='2026-10-06';
  var BOARD_SORT='https://boardsort.com/payout.php';
  var JRS='https://jrsadvancedrecyclers.com/scrap-metal-prices/';
  var DATA={
    board_high:{label:'High grade circuit boards',price:3.20,samples:[{buyer:"J.R.'s Advanced Recyclers",price:3.20,url:JRS,category:'High Grade/Apop'}]},
    board_mid:{label:'Mid grade circuit boards',price:0.65,samples:[{buyer:'BoardSort',price:0.60,url:BOARD_SORT,category:'Mid Grade Board'},{buyer:"J.R.'s Advanced Recyclers",price:0.70,url:JRS,category:'Mid Grade/Bpop'}]},
    board_low:{label:'Low grade circuit boards',price:0.43,samples:[{buyer:'BoardSort',price:0.60,url:BOARD_SORT,category:'Low Grade'},{buyer:"J.R.'s Advanced Recyclers",price:0.25,url:JRS,category:'Low Grade Circuit Boards'}]},
    cell_phone_boards:{label:'Clean cell phone boards',price:20.50,category:'Cell Phone Boards',samples:[{buyer:'BoardSort',price:20.50,url:BOARD_SORT,category:'Cell Phone Boards'}]},
    board_hdd_non_sata:{label:'High grade non-SATA hard drive board',price:20.00,category:'High Grade non-SATA Hard Drive Board'},
    board_hdd_sata:{label:'SATA hard drive board',price:10.00,category:'Low Grade SATA Hard Drive Board'},
    board_cdrom:{label:'CD-ROM / optical drive board',price:8.00,category:'CD-Rom Boards'},
    board_peripheral_high:{label:'Peripheral high grade board',price:5.25,category:'Peripheral High Grade'},
    board_telecom_high:{label:'High grade telecom board',price:9.97,category:'High Grade Telecom'},
    board_telecom_low:{label:'Low grade telecom board',price:6.85,category:'Low Grade Telecom'}
  };
  function get(id){
    var item=DATA[id];if(!item)return null;
    var age=(Date.now()-Date.parse(DATE+'T00:00:00Z'))/86400000;
    return {id:id,label:item.label,price:item.price,unit:'lb',date:DATE,stale:age>30,
      requiresBuyerConfirmation:!!item.category,
      samples:(item.samples||[{buyer:'BoardSort',price:item.price,url:BOARD_SORT,category:item.category}]).map(function(x){return {buyer:x.buyer,price:x.price,url:x.url,category:x.category}})};
  }
  window.ScrapRadarBoardPriceReference={get:get,asOf:DATE,listCategories:function(){return Object.keys(DATA).filter(function(id){return !!DATA[id].category||id==='cell_phone_boards'}).map(function(id){return {id:id,label:DATA[id].label}})}};
})();
