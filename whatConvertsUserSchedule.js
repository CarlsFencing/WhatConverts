/**
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript
 */
define(['N/https', 'N/log', 'N/encode', 'N/record', 'N/search'], function(https, log, encode, record, search) {

    function execute(context) {
        try {

            var webForm = [];
            var phoneCall = [];
            
            searchResults.forEach(function(result) {
                var id = result.getValue('internalid');
                var name = result.getValue('custrecord_gc_wc_lead_contact_name');
                var date = result.getValue('custrecord_gc_wc_date');
                var type = result.getValue('custrecord_gc_wc_lead_type');
                var email = result.getValue('custrecord_gc_wc_email');
                var phone = result.getValue('custrecord_gc_wc_lead_contact_number');
                

                function getCurrentDateMDY() {
                    var today = new Date();
                    
                    var month = (today.getUTCMonth() + 1).toString().padStart(2, '0'); // Months are zero-based
                    var day = today.getUTCDate().toString().padStart(2, '0');
                    var year = today.getUTCFullYear();
                
                    return month + '/' + day + '/' + year;
                }
                
                // Example usage
                var currentDateFormat = getCurrentDateMDY();

                if(currentDateFormat === date){
                    if(type === 'Web Form'){
                        webForm.push(
                            {
                                id: id,
                                name: name,
                                date: date,
                                today: currentDateFormat,
                                type: type,
                                email: email,
                                phone: phone
                            }
                        )
                    }else if(type === 'Phone Call'){
                        phoneCall.push(
                            {
                                id: id,
                                name: name,
                                date: date,
                                today: currentDateFormat,
                                type: type,
                                email: email,
                                phone: phone
                            }
                        )
                    }
                    
                }

                
            });

            var allLeads = [webForm, phoneCall]
            var contactInfo = []

            function mapWebForm(){
                webForm.forEach(function(web, form){

                    var contactSearch = search.create({
                        type: search.Type.CUSTOMER,
                        filters: [
                            ['email', 'is', web.email]
                        ],
                        columns: [
                            'internalid',
                            'entityid',
                            'email',
                        ]
                    });
            
         
                    var contactRun = contactSearch.run();
                    var contacts = contactRun.getRange({
                        start: 0,
                        end: 1000
                    });
            
                    
                    
                    contacts.forEach(function(e, x){
                        var name = e.getValue('entityid')
                        var email = e.getValue('email')
                        var id = e.getValue('internalid')

                        contactInfo.push(id)

                        var contactRecord = record.load({
                            type: record.Type.CUSTOMER,
                            id: id
                        });

                        //SET CUSTOMER RECORD TO WEB FORM ID
                        
                        var existingRecord = contactRecord.getValue({fieldId: 'custentity_gc_what_converts_info'});
                        var existingWebForms = existingRecord.concat(web.id)
                        

                        
                        contactRecord.setValue({fieldId: 'custentity_gc_what_converts_info', value: existingWebForms});
                        contactRecord.save({
                            enableSourcing: false,
                            ignoreMandatoryFields: true,
                            synchronous: true
                        });
                        

                        //SET WEB FORM RECORD TO CONTACT ID

                        var whatConvertsWebForm = record.load({
                            type: 'customrecord_gc_what_converts_leads',
                            id: web.id
                        });

                        var existingCustomer = whatConvertsWebForm.getValue({fieldId: 'custrecord_gc_wc_lead_customer_record'});
                        var existingCustomerRecord = existingCustomer.concat(id)

    

                        whatConvertsWebForm.setValue({fieldId: 'custrecord_gc_wc_lead_customer_record', value: existingCustomerRecord });
                        whatConvertsWebForm.save({
                            enableSourcing: false,
                            ignoreMandatoryFields: true,
                            synchronous: true
                        });
                        
                        
                    });

                    

                    

                });

            }
            mapWebForm();


            function mapPhoneCall(){
                var phoneNumberWtihId = [];
                phoneCall.forEach(function(phone, form){
                    var phoneNumberOne = phone.phone;
                    var phoneNumberTwo = phone.phone.replaceAll('+1', '')
                    var p = phoneNumberTwo.split('');
                    var phoneNumberThree = '('+p[0]+p[1]+p[2]+') '+p[3]+p[4]+p[5]+'-'+p[6]+p[7]+p[8]+p[9];
                    var phoneNumberFour = '+1 '+phoneNumberThree
                    phoneNumberWtihId.push(
                        {
                            id: phone.id,
                            numbers: [phoneNumberOne, phoneNumberTwo, phoneNumberThree, phoneNumberFour]
                        }
                    )
                });



                phoneNumberWtihId.forEach(function(phone, form){

                    var filters = [];
                    phone.numbers.forEach(function(phoneNumber) {
                        filters.push(['phone', 'contains', phoneNumber]);
                        filters.push('OR');
                    });

                    // Remove the last 'OR' to avoid syntax issues
                    if (filters.length > 0) {
                        filters.pop();
                    }

                    filters.push('AND');
                    filters.push(['isinactive', 'is', false]);

                    var contactSearch = search.create({
                        type: search.Type.CUSTOMER,
                        filters: filters,
                        columns: [
                            'internalid',
                            'entityid',
                            'email',
                            'phone',
                            'isinactive'
                        ]
                    });
            
         
                    var contactRun = contactSearch.run();
                    var contacts = contactRun.getRange({
                        start: 0,
                        end: 1000
                    });
            
                    
                    var emailCount = {}; // To count occurrences of each email
                    var duplicateEmails = []; // To store duplicates

                    contacts.forEach(function(e, x){
                        var isinactive = e.getValue('isinactive')

                        if(isinactive !== true){
                            var name = e.getValue('entityid')
                            var email = e.getValue('email')
                            var id = e.getValue('internalid')
                            var number = e.getValue('phone')
                            

                            contactInfo.push({
                                name: name,
                                id: id,
                                email: email,
                                phone: number,
                                status: isinactive
                            });

                            if (emailCount[email]) {
                                emailCount[email]++;
                                if (!duplicateEmails.includes(email)) {
                                    duplicateEmails.push(email); // Push to duplicates if it's the second occurrence
                                }
                            } else {
                                emailCount[email] = 1; // Initialize count
                            }

                            
                            
                            var whatConvertsWebForm = record.load({
                                type: 'customrecord_gc_what_converts_leads',
                                id: phone.id
                            });
                            
                            whatConvertsWebForm.setValue({fieldId: 'custrecord_gc_email_dup', value: false });
                            var existingCustomer = whatConvertsWebForm.getValue({fieldId: 'custrecord_gc_wc_lead_customer_record'});
                            var existingCustomerRecord = existingCustomer.concat(id)
        
                            whatConvertsWebForm.setValue({fieldId: 'custrecord_gc_wc_lead_customer_record', value: existingCustomerRecord });

                            log.debug('email count length', Object.values(emailCount).length)

                            if(Object.values(emailCount).length > 1 ){
                                whatConvertsWebForm.setValue({fieldId: 'custrecord_gc_email_dup', value: true });
                            }
                            
                            
                            whatConvertsWebForm.save({
                                enableSourcing: false,
                                ignoreMandatoryFields: true,
                                synchronous: true
                            });
                            

                        }

                    });


                });

                phoneNumberWtihId.forEach(function(phone, form){
                    var whatConvertsWebForm = record.load({
                        type: 'customrecord_gc_what_converts_leads',
                        id: phone.id
                    });

                    var duplicateRecords = whatConvertsWebForm.getValue({fieldId: 'custrecord_gc_email_dup'});
                    if(duplicateRecords !== true){

                        var existingCustomer = whatConvertsWebForm.getValue({fieldId: 'custrecord_gc_wc_lead_customer_record'});
                        existingCustomer.forEach(function(id, exst){

                            var contactRecord = record.load({
                                type: record.Type.CUSTOMER,
                                id: id
                            });

                            //SET CUSTOMER RECORD TO WEB FORM ID
                            
                            var existingRecord = contactRecord.getValue({fieldId: 'custentity_gc_what_converts_info'});
                            var existingWebForms = existingRecord.concat(phone.id)
                            

                            
                            contactRecord.setValue({fieldId: 'custentity_gc_what_converts_info', value: existingWebForms});
                            contactRecord.save({
                                enableSourcing: false,
                                ignoreMandatoryFields: true,
                                synchronous: true
                            });

                        });
                    }
                });

                
                
                

            }
            mapPhoneCall();



        } catch (error) {
            log.error({
                title: 'API Error',
                details: error.message + '\nStack: ' + error.stack
            });
        }
    }

    return {
        execute: execute
    };
});
