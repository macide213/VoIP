const Telnyx = require('telnyx');
var axios = require('axios');
const moment = require('moment');
const crypto = require('crypto')
var util = require('util'); 
const { combineURLs } = require("./common.helper")

//Inside lib file declare functions
const requestCurl = (method,url,headers,data=null) => {
    return new Promise((resolve) => {
        if(data){
            var config = {
                method: method,
                url: url,
                headers: headers,
                data:data
            };
        }else{
            var config = {
                method: method,
                url: url,
                headers: headers
            };   
        }
        axios(config).then(function (response) {
            resolve(response.data);
        }).catch(function (error) {
            // console.log(error)
            resolve(false);
        });
    });
}
 
const createTexmlApp = (apiKey) => {
    return new Promise(async (resolve,reject) =>  {
        var url = `https://api.telnyx.com/v2/texml_applications`;
        var headers =  { 
            'Content-Type': 'application/json', 
            'Accept': 'application/json', 
            'Authorization': `Bearer ${apiKey}`
          };
        var data = {
          friendly_name: moment().format("YYYYMMDDHHmm"),
          voice_url: combineURLs(process.env.BASE_URL.trim(), "api/call/telnyx"),
          voice_method: "post",
          status_callback: combineURLs(
            process.env.BASE_URL.trim(),
            "api/call/status/telnyx"
          ),
          status_callback_method: "post",
        };
        var response = await requestCurl('POST',url,headers, data);
        resolve(response);
    });
}

const updateTexmlApp = (apiKey, twimlid) => {
    return new Promise(async (resolve,reject) =>  {
        var url = `https://api.telnyx.com/v2/texml_applications/${twimlid}`;
        var headers =  { 
            'Content-Type': 'application/json', 
            'Accept': 'application/json', 
            'Authorization': `Bearer ${apiKey}`
          };
        var data = {
          voice_url: combineURLs(process.env.BASE_URL.trim(), "api/call/telnyx"),
          voice_method: "post",
          status_callback: combineURLs(
            process.env.BASE_URL.trim(),
            "api/call/status/telnyx"
          ),
          status_callback_method: "post",
        };
        var response = await requestCurl('PATCH',url,headers, data);
        resolve(response);
    });
}

const deleteTexmlApp = (apiKey, twimlid) => {
    return new Promise(async (resolve,reject) =>  {
        var url = `https://api.telnyx.com/v2/texml_applications/${twimlid}`;
        var headers =  { 
            'Content-Type': 'application/json', 
            'Accept': 'application/json', 
            'Authorization': `Bearer ${apiKey}`
          };
        var response = await requestCurl('DELETE',url,headers);
        resolve(response);
    });
}

const createSIPApp = (apiKey, userid, outboundProfileid) => {
    // console.log(outboundProfileid)
    return new Promise(async (resolve,reject) =>  {
        try{
            const telnyx = Telnyx(apiKey);
            // In Node 10
            var password = crypto.randomBytes(16).toString('hex');
            const credentialConnection =
              await telnyx.credentialConnections.create({
                connection_name: `sip${moment().format("YYYYMMDDHHmm")}`,
                user_name: `user${moment().format("YYYYMMDDHHmm")}`,
                password: password,
                webhook_event_url: combineURLs(
                  process.env.BASE_URL.trim(),
                  "api/call/status/telnyx"
                ),
                outbound: { outbound_voice_profile_id: outboundProfileid },
                sip_uri_calling_preference: "unrestricted",
              });
            resolve(credentialConnection);
        }catch(error){
            console.log(error)
            resolve(false);
        }
    });
}

const updateSIPApp = (apiKey, uuid, outboundProfileid) => {
    return new Promise(async (resolve,reject) =>  {
        try{
            const telnyx = Telnyx(apiKey);
            const { data: credentialConnection } = await telnyx.credentialConnections.retrieve(uuid);
            credentialConnection.update({
              webhook_event_url: combineURLs(
                process.env.BASE_URL.trim(),
                "api/call/status/telnyx"
              ),
              outbound: { outbound_voice_profile_id: outboundProfileid },
              sip_uri_calling_preference: "unrestricted",
            });
            resolve(true);
        }catch(error){
            // console.log(error)
            resolve(false);
        }
    });
}

const deleteSIPApp = (apiKey, uuid) => {
    return new Promise(async (resolve,reject) =>  {
        try{
            const telnyx = Telnyx(apiKey);
            const { data: credentialConnection } = await telnyx.credentialConnections.retrieve(uuid);
            await credentialConnection.del();
            resolve(true);
        }catch(error){
            // console.log(error)
            resolve(false);
        }
    });
}
function getAllMethods(object) {
    Object.getOwnPropertyNames(object).filter(function(property) {
        if(property.substring(0,1)=='_'){

        }else{
        try {
            console.log(typeof object[property] + ': ' + property);
        } catch (error) {
            console.log(error.message)
        }
        
         if(typeof object[property] == 'object'){
            console.log('----------------start ' + property)
            try {
            getAllMethods(object[property])
        } catch (error) {
            console.log(error.message)
        }
        
            console.log('----------------stop ' + property)
         }
        }
    });
}

const createOutboundVoice = (apiKey) => {
    return new Promise(async (resolve,reject) =>  {
        try{
            
           const myname = `outbound${moment().format('YYYYMMDDHHmm')}`
            console.log('----------------telnyx')
            const telnyx = Telnyx(apiKey);
            getAllMethods(telnyx);
            console.log('-------------outboundVoiceProfiles')
           getAllMethods(telnyx.outboundVoiceProfiles);
           //console.log('telnyx.outboundVoiceProfiles.create')
           //getAllMethods(telnyx.outboundVoiceProfiles.create);
            // In Node 10
            const outboundVoiceProfiles = await telnyx.outboundVoiceProfiles.create(
                {"name": myname}
              );
              // console.log(outboundVoiceProfiles.data)
              getAllMethods(outboundVoiceProfiles)
            resolve(outboundVoiceProfiles);
        }catch(error){
            console.log(error.message)
             console.log(error.stack)
            resolve(false);
        }
    });
}

const deleteOutboundVoice = (apiKey, profileid) => {
    return new Promise(async (resolve,reject) =>  {
        try{
            const telnyx = Telnyx(apiKey);
            const { data: outboundVoiceProfiles } = await telnyx.outboundVoiceProfiles.retrieve(profileid);
            await outboundVoiceProfiles.del();
            resolve(true);
        }catch(error){
            // console.log(error)
            resolve(false);
        }
    });
}

const updatePhoneNumber = (apiKey, numbersid) => {
    return new Promise(async (resolve,reject) =>  {
        try{
            const telnyx = Telnyx(apiKey);
            await telnyx.phoneNumbers.update(
                numbersid,
                { connection_id: '' }
              ); 
            resolve(true);
        }catch(error){
            resolve(false);
        }
    });
}

const emptyMessageProfile = (apiKey, numbersid) => {
    return new Promise(async (resolve,reject) =>  {
        try{
            const telnyx = Telnyx(apiKey);
            await telnyx.phoneNumbers.updateMessagingSettings(
                numbersid,
                { messaging_profile_id: "" }
            ); 
            resolve(true);
        }catch(error){
            resolve(false);
        }
    });
}

const deleteMessageProfile = (apiKey, numbersid) => {
    return new Promise(async (resolve,reject) =>  {
        try{
            const telnyx = Telnyx(apiKey);
            const { data: messagingProfiles } = await telnyx.messagingProfiles.retrieve(numbersid); 
            await messagingProfiles.del();
            resolve(true);
        }catch(error){
            resolve(false);
        }
    });
}

const messageProfileFallback = async (data) => {
    return new Promise(async (resolve,reject) =>  {
        try{
            const telnyx = Telnyx(data.apiKey);
            await telnyx.messagingProfiles.update(data.setting, 
                {
                    "webhook_failover_url": data.url
                }
            );
            resolve(true);
        }catch(error){
            resolve(false);
        }
    });
}

const texmlAppFalback = async (data2) => {
    return new Promise(async (resolve,reject) =>  {
        var url = `https://api.telnyx.com/v2/texml_applications/${data2.twimlid}`;
        var headers =  { 
            'Content-Type': 'application/json', 
            'Accept': 'application/json', 
            'Authorization': `Bearer ${data2.apiKey}`
          };
        var data = {
            "voice_fallback_url" : `${data2.url}`,
            "voice_method" : 'post',
        }
        var response = await requestCurl('PATCH',url,headers, data);
        resolve(response);
    });
}

const sIPAppFallback = async (data) => {
    return new Promise(async (resolve,reject) =>  {
        try{
            const telnyx = Telnyx(data.apiKey);
            const { data: credentialConnection } = await telnyx.credentialConnections.retrieve(data.uuid);
            credentialConnection.update({ 
                webhook_event_failover_url: `${data.url}`,
            });
            resolve(true);
        }catch(error){
            // console.log(error)
            resolve(false);
        }
    });
}

const messageProfileGet = async (data) => {
    return new Promise(async (resolve,reject) =>  {
        try{
            var url = `https://api.telnyx.com/v2/messaging_profiles/${data.setting}`;
            var headers =  { 
                'Content-Type': 'application/json', 
                'Accept': 'application/json', 
                'Authorization': `Bearer ${data.apiKey}`
              };
            var response = await requestCurl('GET',url,headers);
            resolve(response);
        }catch(error){
            console.log(error)
            resolve(false);
        }
    });
}

const texmlAppGet = async (data) => {
    return new Promise(async (resolve,reject) =>  {
        var url = `https://api.telnyx.com/v2/texml_applications/${data.twimlid}`;
        var headers =  { 
            'Content-Type': 'application/json', 
            'Accept': 'application/json', 
            'Authorization': `Bearer ${data.apiKey}`
          };
        var response = await requestCurl('GET',url,headers);
        resolve(response);
    });
}

const sIPAppGet = async (data) => {
    return new Promise(async (resolve,reject) =>  {
        try{
            var url = `https://api.telnyx.com/v2/credential_connections/${data.uuid}`;
            var headers =  { 
                'Content-Type': 'application/json', 
                'Accept': 'application/json', 
                'Authorization': `Bearer ${data.apiKey}`
              };
            var response = await requestCurl('GET',url,headers);
            resolve(response);
        }catch(error){
            // console.log(error)
            resolve(false);
        }
    });
}

const getNumberData = async (data) => {
    return new Promise(async (resolve,reject) =>  {
        try{
            var url = `https://api.telnyx.com/v2/phone_numbers/${data.number_sid}`;
            var headers =  { 
                'Content-Type': 'application/json', 
                'Accept': 'application/json', 
                'Authorization': `Bearer ${data.apiKey}`
              };
            var response = await requestCurl('GET',url,headers);
            resolve(response);
        }catch(error){
            // console.log(error)
            resolve(false);
        }
    });
}

module.exports = {
    requestCurl, createTexmlApp, updateTexmlApp, deleteTexmlApp, createSIPApp, updateSIPApp, deleteSIPApp, createOutboundVoice, deleteOutboundVoice, updatePhoneNumber, emptyMessageProfile, deleteMessageProfile, messageProfileFallback, texmlAppFalback, sIPAppFallback, messageProfileGet, texmlAppGet, sIPAppGet, getNumberData
}
