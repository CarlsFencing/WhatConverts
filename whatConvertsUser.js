/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 */
define(['N/record', 'N/log', 'N/search'], function(record, log, search) {
    function afterSubmit(context) {

        if(context.type === context.UserEventType.EDIT){
            var newRecord = context.newRecord;
            var internalid = newRecord.id;
            var recordType = newRecord.type;

            

            var leadRecord = record.load({
                type: "customrecord_gc_what_converts_leads",
                id: internalid
            });

            var multipleRecrords = leadRecord.getValue({fieldId: 'custrecord_gc_email_dup'});
            var updateRecord = leadRecord.getValue({fieldId: 'custrecord_gc_lead_contact_rec_update'});

            if(multipleRecrords && updateRecord){

                var customerRecords = leadRecord.getValue({fieldId: 'custrecord_gc_wc_lead_customer_record'});

                customerRecords.forEach(function(c, x){

                    var contactRecord = record.load({
                        type: record.Type.CUSTOMER,
                        id: c
                    });


                    

                    var existingRecord = contactRecord.getValue({fieldId: 'custentity_gc_what_converts_info'});
                    var existingWebForms = existingRecord.concat(web.id)
                    
                    
                    contactRecord.setValue({fieldId: 'custentity_gc_what_converts_info', value: existingWebForms});
                    contactRecord.save({
                        enableSourcing: false,
                        ignoreMandatoryFields: true,
                        synchronous: true
                    });


                });

                leadRecord.setValue({fieldId: 'custrecord_gc_email_dup', value: false});
                leadRecord.setValue({fieldId: 'custrecord_gc_lead_contact_rec_updates', value: false});
                leadRecord.save()

                
            }
            
         

        }

    }

    return {
        afterSubmit: afterSubmit
    };
});
