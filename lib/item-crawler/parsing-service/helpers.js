var cheerio = require('cheerio');
var { getId, getElement, getDate, sanatizer } = require('../helpers');

module.exports = {
  effectParse: (body) => {
    var item = [];
    var $ = cheerio.load(body);
    $('div.ak-list-element').each(function(i, element){
      var stat = $(this).find( "div.ak-title" ).text().trim();
      var statToTest = stat.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "");
      if (statToTest.includes('title') || statToTest.includes('titre') || statToTest.includes('attitude') || statToTest.includes('emote') || 
      statToTest.includes('echangeable') || statToTest.includes('exchangeable') || statToTest.includes('lie au') || statToTest.includes('linked to')) {
        if (statToTest.includes('title') || statToTest.includes('titre')) item.push({'title': stat.split(':')[1].trim()});
        else if (statToTest.includes('attitude') || statToTest.includes('emote')) item.push({'emote': stat});
        else if (statToTest.includes('echangeable') || statToTest.includes('exchangeable')) item.push({'exchangeable': getDate(stat)});
        else if (statToTest.includes('lie au') || statToTest.includes('linked to')) item.push({'linked': true});
      }else {
        var stat = $(this).find( "div.ak-title" ).text().trim();
        var element = getElement(stat);
        element = element.charAt(0).toUpperCase() + element.slice(1);
        var numbers = [];
        stat.replace(/(-?\d[\d\.]*)/g, function( x ) { 
          var n = Number(x); if (x == n) { numbers.push(x); }  
        });
        if(typeof numbers[1] == 'undefined') var groupeElement = {[element]: {'from': numbers[0]}};
        else var groupeElement = {[element]: {'from': numbers[0], 'to': numbers[1]}};
        item.push(groupeElement);
      }
    });
    return item;
  },

  recipeParse: (body) => {
    var item = [];
    var $ = cheerio.load(body);
    $('div.ak-container.ak-panel.ak-crafts').find('div.ak-panel-content').find('div.ak-container.ak-content-list').find('div.ak-column').each(function(i, element){
        var setUrl = 'https://www.dofus-touch.com' + $(this).find('div.ak-title').find('a').attr('href');
        var setId = $(this).find('div.ak-title').find('a').attr('href').replace(/\D/g,'');
        var setImage = $(this).find('div.ak-image').find('a').find('span.ak-linker').find('img').attr('src').replace('dofus/ng/img/../../../', '');
        var setQuantity = $(this).find('div.ak-front').text().replace(/\x/g,'').trim();
        var setName = $(this).find('div.ak-content').find('div.ak-title').find('a').find('span.ak-linker').text().trim();
        var setType = $(this).find('div.ak-content').find('div.ak-text').text().trim();
        var setLvl = $(this).find('div.ak-aside').text().replace(/\D/g,'').trim();

        var groupeElement = {[setName]: {
            'id': setId, 
            'url': setUrl,
            'imgUrl': setImage,
            'type': setType,
            'lvl': setLvl,
            'quantity': setQuantity
        }};
        item.push(groupeElement);
    });
    return item;
  },

  descriptionParse: (body, url) => {
    var $ = cheerio.load(body);
    var itemId = getId(url);
    var type = $('div.ak-encyclo-detail-right.ak-nocontentpadding').find('div.ak-encyclo-detail-type.col-xs-6').find('span').text().trim();
    var name = $('h1.ak-return-link').text().trim();
    var description = $('div.ak-encyclo-detail-right.ak-nocontentpadding').find('div.ak-container.ak-panel').first().find('div.ak-panel-content').text().trim();
    var lvl = $('div.ak-encyclo-detail-right.ak-nocontentpadding').find('div.ak-encyclo-detail-level.col-xs-6.text-right').text().trim().replace(/\D/g,'');
    var imgUrl = $('div.ak-encyclo-detail-illu').find('img').attr('src').replace('dofus/ng/img/../../../', '');
    
    var item = {
      _id: itemId,
      name: name,
      description: description,
      lvl: lvl,
      type: type,
      imgUrl: imgUrl,
      url: url
    }
    return item;
  }
};