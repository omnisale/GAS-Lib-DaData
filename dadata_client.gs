/*

Клиент для работы с API Data

https://confluence.hflabs.ru/pages/viewpage.action?pageId=204669102
https://dadata.ru/api/clean/record/

https://dadata.userecho.com/knowledge-bases/4-baza-znanij

https://gist.github.com/nalgeon/a6db0827dad7a97da906d6427c070883

*/

function test_clean() {
 var my_DD = new DaData('8bc470e12678748fe42cd9a07352d7c683019e26',"31aa174224832d947cb28e600a3ad384d5d7cf85");
 
 var r=my_DD.cleanClient(
   { 
     address:'119464, Moscow	Moscow	улица Коштоянца 2,Западный административный округ кв. 253',
     email:'fasfas',
     phone: '89162192407',
     name: 'PAVEL MAKOKLYUEV'
   }
 );
 Logger.log(r);
 
 for (var key in r) {
  // этот код будет вызван для каждого свойства объекта
  // ..и выведет имя свойства и его значение

    Logger.log("Ключ: " + key + " значение: " );
    Logger.log(r[key]);
   }
   
   return true;
 
}

function test_adr() {

  var my_DD = new DaData('8bc470e12678748fe42cd9a07352d7c683019e26');
  //var r=DDS.getTokeh('fdgfd');

  var r=my_DD.guessAddressByPostCode('г. Москва, г. Зеленоград, мкр 3-й, дом 306', '124482' );
   // Logger.log(r);
  
  if(r==null) { Logger.log("Aдрес не соответствует индекcу"); return false; }
  
  if(r.fias_level<8) { Logger.log("Не удалось распознать адрес по базе ФИАС с точносью до дома");   }
  
  for (var key in r) {
  // этот код будет вызван для каждого свойства объекта
  // ..и выведет имя свойства и его значение

    Logger.log("Ключ: " + key + " значение: " + r[key] );
   }
   
   return true;
   
   // код региона (первые два символа из region_kladr_id)
   // местоположение (конструируем из region_with_type + area_with_type + city_with_type + settlement_with_type ) 
   //    при этом смотрим region_type_full если он НЕ равен "город" то берём region_with_type (иначе пропускаем)
   //    
   // город/населённый пункт (settlement / а если оно пусто то city)
   // улица (street_with_type)
   // дом (house)
   // корпус (block)
   // квартира (flat)

}

/* ------------  */

function DaData(api_key,secret_key) {

this.API_KEY=api_key;
this.SECRET_KEY=secret_key;


this.GUESS_FORMATTERS = {
  address: formatAddress,
  fio: formatFio,
  party: formatParty,
  bank: formatBank,
  addressObj: formatAddressObj,
};

this.getTokeh = function() {
  return this.API_KEY;
}

this.guessAddress = function(query) {
  return this.guess("address", query);
}

this.guessFio = function(query) {
  return this.guess("fio", query);
}

this.guessParty = function(query) {
  return this.guess("party", query);
}

this.guessBank = function(query) {
  return this.guess("bank", query);
}


this.guess = function(type, query) {
  if (this.API_KEY === "ВАШ_API_КЛЮЧ") {
    return "Укажите ваш API-ключ в переменной API_KEY";
  }
  var response = suggest(this.API_KEY, type, { "query": query} );
  if (response.suggestions.length > 0) {
    return this.GUESS_FORMATTERS[type](response.suggestions[0]);
  } else {
    return "Ничего не найдено";
  }
}

this.guessAddressByPostCode = function(adress, index) {
  if (this.API_KEY === "ВАШ_API_КЛЮЧ") {
    return "Укажите ваш API-ключ в переменной API_KEY";
  }
  var response = suggest(this.API_KEY, 'address', { "query": adress, /*"locations": [{ "postal_code": index }]  */ } );
  if (response.suggestions.length > 0) {
    return this.GUESS_FORMATTERS['addressObj'](response.suggestions[0]);
  } else {
    return null;
  } 
}

this.guessRaw = function(type, query, params) {
  params=params || {};
  params.query = query;
  if (this.API_KEY === "ВАШ_API_КЛЮЧ") {
    return "Укажите ваш API-ключ в переменной API_KEY";
  }
  return suggest(this.API_KEY, type, params);
}


function formatAddress(suggestion) {
  var postalCode = suggestion.data.postal_code;
  var address = suggestion.value;
  if (postalCode) {
    address = postalCode + ", " + address;
  }
  return [
    ["Адрес", address]
  ];
};

function formatAddressObj(suggestion) {
  return { 
      address1: suggestion.value,
      address2: suggestion.unrestricted_value,
      index: suggestion.data.postal_code,
      federal_district: suggestion.data.federal_district,
      region: suggestion.data.region,
      region_type_full: suggestion.data.region_type_full,
      region_with_type: suggestion.data.region_with_type,
      region_kladr_id: suggestion.data.region_kladr_id,
      region_fias_id: suggestion.data.region_fias_id,
      area: suggestion.data.area,
      area_type_full: suggestion.data.area_type_full,
      area_with_type: suggestion.data.area_with_type,
      city: suggestion.data.city,
      city_type_full: suggestion.data.city_type_full,
      city_with_type: suggestion.data.city_with_type,
      settlement: suggestion.data.settlement,
      settlement_type_full: suggestion.data.settlement_type_full,
      settlement_with_type: suggestion.data.settlement_with_type,
      street: suggestion.data.street,
      street_type_full: suggestion.data.street_type_full,
      street_with_type: suggestion.data.street_with_type,
      house: suggestion.data.house,
      block: suggestion.data.block,
      flat: suggestion.data.flat,
      fias_level: suggestion.data.fias_level,
      fias_id: suggestion.data.fias_id
      
  };
  return suggestion;
};

function formatGender(gender) {
  genders = {
    MALE: "мужской",
    FEMALE: "женский",
    UNKNOWN: "неизвестный"
  }
  return genders[gender];
};

function formatFio(suggestion) {
  var fio = suggestion.data;
  return [
      ["Фамилия", fio.surname],
      ["Имя", fio.name],
      ["Отчество", fio.patronymic],
      ["Пол", formatGender(fio.gender)]
    ];
};

function formatParty(suggestion) {
  var party = suggestion.data;
  return [
      ["Название", party.name.short_with_opf],
      ["ОГРН", party.ogrn],
      ["ИНН", party.inn],
      ["КПП", party.kpp],
      ["ОКВЭД", party.okved],
      ["Дата регистрации", party.state.registration_date],
      ["Адрес", party.address.value]
    ];
}

function formatBank(suggestion) {
  var bank = suggestion.data;
  return [
      ["Название", bank.name.payment],
      ["БИК", bank.bic],
      ["SWIFT", bank.swift],
      ["Адрес", bank.address.value]
    ];
}

function suggest(api_key, type, request_data) {
  var url = "https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/" + type;
  
  var headers = {
    "Authorization": "Token " + api_key
  };

  var fetchArgs = {
    method: "POST",
    contentType: "application/json",
    payload: JSON.stringify(request_data),
    headers: headers,
    muteHttpExceptions: false
  };
  return JSON.parse(UrlFetchApp.fetch(url, fetchArgs));
}

this.cleanFio = function(query) {
  if (this.API_KEY == undefined) {
    return "Укажите ваш API-ключ в переменной API_KEY";
  }
  if (this.SECRET_KEY == undefined) {
    return "Укажите ваш секретный  ключ в переменной SECRET_KEY_KEY";
  }  
  var response = clean(this.API_KEY, this.SECRET_KEY , "name", [ query] );
  return response[0];
}

this.cleanAddress = function(query) {
  if (this.API_KEY == undefined) {
    return "Укажите ваш API-ключ в переменной API_KEY";
  }
  if (this.SECRET_KEY == undefined) {
    return "Укажите ваш секретный  ключ в переменной SECRET_KEY_KEY";
  }  
  var response = clean(this.API_KEY, this.SECRET_KEY , "address", [ query] );
  return response[0];
}

this.cleanClient = function(client) {

  var name = client.name || '';
  var phone = client.phone || '';
  var email = client.email || '';
  var address = client.address || '';
  
  if (this.API_KEY == undefined) {
    return "Укажите ваш API-ключ в переменной API_KEY";
  }
  if (this.SECRET_KEY == undefined) {
    return "Укажите ваш секретный  ключ в переменной SECRET_KEY_KEY";
  }  
  var response = clean(this.API_KEY, this.SECRET_KEY , "", 
      {
          "structure":
            [
                "NAME",
                "PHONE",
                "EMAIL",
                "ADDRESS"
            ],
          "data": [
            [
                name,
                phone,
                email,
                address
            ]
          ]
      }
  );
  return formatClient(response);
}

function formatClient(data) {
  var r={};
  data.structure.forEach(function(field, i, arr) { // цикл свойствам
      r[field.toLowerCase()]=data.data[0][i];
  });
  return r;
}

function clean(api_key, secret_key, type, request_data) {
  var url = "https://cleaner.dadata.ru/api/v1/clean/" + type;
  
  var headers = {
    "Authorization": "Token " + api_key,
    "X-Secret": secret_key
  };

  var fetchArgs = {
    method: "POST",
    contentType: "application/json",    
    payload: JSON.stringify(request_data),
    headers: headers,
    muteHttpExceptions: false
  };
  return JSON.parse(UrlFetchApp.fetch(url, fetchArgs));
}

return this;

}

