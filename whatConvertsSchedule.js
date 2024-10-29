/**
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript
 */
define(['N/https', 'N/log', 'N/encode', 'N/record', 'N/search'], function(https, log, encode, record, search) {

    function execute(context) {
        try {

            function getEmptyString() {
                return String();
            }
            const ES = getEmptyString();

            var apiUrl = 'https://app.whatconverts.com/api/v1/leads';
            var token = '124943-16d918d48c99882c';
            var secret = 'd2d88a180bce095e58814b8c04058444';

            var credentials = token + ':' + secret;
            var encodedCredentials = encode.convert({
                string: credentials,
                inputEncoding: encode.Encoding.UTF_8,
                outputEncoding: encode.Encoding.BASE_64
            });

            var headers = {
                'Authorization': 'Basic ' + encodedCredentials,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            };

            var allLeads = [];
            var pageNumber = 1;
            var leadsPerPage = 25;
            var totalPages = 1;
            var totalLeadsFetched = 0;
            var maxLeadsToFetch = 100; // Stop once 100 leads are fetched

            // Fetch all leads through pagination until we hit the limit of 100 leads
            while (pageNumber <= totalPages && totalLeadsFetched < maxLeadsToFetch) {
                var response = https.get({
                    url: apiUrl + '?page_number=' + pageNumber + '&leads_per_page=' + leadsPerPage,
                    headers: headers
                });
                /*

                log.debug({
                    title: 'API Response for Page ' + pageNumber,
                    details: response.body
                });
                */

                var leadsData = JSON.parse(response.body);

                if (leadsData && Array.isArray(leadsData.leads)) {
                    allLeads = allLeads.concat(leadsData.leads);
                    totalLeadsFetched = allLeads.length;
                    pageNumber++;
                    totalPages = leadsData.total_pages;
                } else {
                    log.error({
                        title: 'API Response Format Error',
                        details: 'Unexpected response format or missing leads data.'
                    });
                    break;
                }

                // If we've reached the maximum of 100 leads, stop fetching
                if (totalLeadsFetched >= maxLeadsToFetch) {
                    /*
                    //log.debug({
                        title: 'Max Leads Fetched',
                        details: 'Reached the limit of ' + maxLeadsToFetch + ' leads'
                    });
                    */
                    break;
                }
            }

            var leadDetails = allLeads.map(function(lead) {
                return {
                    LeadID: lead.lead_id || 'N/A',
                    AccountID: lead.account_id || 'N/A',
                    ProfileID: lead.profile_id || 'N/A',
                    Profile: lead.profile || 'N/A',
                    UserID: lead.user_id || 'N/A',
                    LeadType: lead.lead_type || 'N/A',
                    LeadStatus: lead.lead_status || 'N/A',
                    DateCreated: lead.date_created || 'N/A',
                    Quotable: lead.quotable || 'N/A',
                    SpottedKeywords: lead.spotted_keywords || 'N/A',
                    LeadScore: lead.lead_score || 'N/A',
                    LeadState: lead.lead_state || 'N/A',
                    LeadSource: lead.lead_source || 'N/A',
                    LeadMedium: lead.lead_medium || 'N/A',
                    LeadCampaign: lead.lead_campaign || 'N/A',
                    LeadContent: lead.lead_content || 'N/A',
                    LeadKeyword: lead.lead_keyword || 'N/A',
                    LeadURL: lead.lead_url || 'N/A',
                    LandingURL: lead.landing_url || 'N/A',
                    OperatingSystem: lead.operating_system || 'N/A',
                    Browser: lead.browser || 'N/A',
                    DeviceType: lead.device_type || 'N/A',
                    DeviceMake: lead.device_make || 'N/A',
                    Spam: lead.spam || 'N/A',
                    Duplicate: lead.duplicate || 'N/A',
                    TrackingNumber: lead.tracking_number || 'N/A',
                    DestinationNumber: lead.destination_number || 'N/A',
                    CallerCountry: lead.caller_country || 'N/A',
                    CallerState: lead.caller_state || 'N/A',
                    CallerZip: lead.caller_zip || 'N/A',
                    CallerName: lead.caller_name || 'N/A',
                    CallDuration: lead.call_duration || 'N/A',
                    CallDurationSeconds: lead.call_duration_seconds || 'N/A',
                    CallerCity: lead.caller_city || 'N/A',
                    AnswerStatus: lead.answer_status || 'N/A',
                    CallStatus: lead.call_status || 'N/A',
                    LineType: lead.line_type || 'N/A',
                    CallerNumber: lead.caller_number || 'N/A',
                    PhoneName: lead.phone_name || 'N/A',
                    Message: lead.message || 'N/A',
                    IPAddress: lead.ip_address || 'N/A',
                    Notes: lead.notes || 'N/A',
                    ContactName: lead.contact_name || 'N/A',
                    ContactCompanyName: lead.contact_company_name || 'N/A',
                    ContactEmailAddress: lead.contact_email_address || 'N/A',
                    ContactPhoneNumber: lead.contact_phone_number || 'N/A',
                    EmailAddress: lead.email_address || 'N/A',
                    PhoneNumber: lead.phone_number || 'N/A',
                    Gclid: lead.gclid || 'N/A',
                    Msclkid: lead.msclkid || 'N/A',
                    UnbouncePageID: lead.unbounce_page_id || 'N/A',
                    UnbounceVariantID: lead.unbounce_variant_id || 'N/A',
                    UnbounceVisitorID: lead.unbounce_visitor_id || 'N/A',
                    SalesforceUserID: lead.salesforce_user_id || 'N/A',
                    RoistatVisitID: lead.roistat_visit_id || 'N/A',
                    HubspotVisitorID: lead.hubspot_visitor_id || 'N/A',
                    FacebookBrowserID: lead.facebook_browser_id || 'N/A',
                    FacebookClickID: lead.facebook_click_id || 'N/A',
                    VwoAccountID: lead.vwo_account_id || 'N/A',
                    VwoExperimentID: lead.vwo_experiment_id || 'N/A',
                    VwoVariantID: lead.vwo_variant_id || 'N/A',
                    VwoUserID: lead.vwo_user_id || 'N/A',
                    GoogleAnalyticsClientID: lead.google_analytics_client_id || 'N/A',
                    LeadAnalysis: lead.lead_analysis || 'N/A',
                    AdditionalFields: lead.additional_fields || 'N/A',
                    FieldMappings: lead.field_mappings || 'N/A',
                    CustomerJourney: lead.customer_journey || 'N/A',
                    Recording: lead.recording || 'N/A',
                    PlayRecording: lead.play_recording || 'N/A',
                    Voicemail: lead.voicemail || 'N/A',
                    PlayVoicemail: lead.play_voicemail || 'N/A',
                    CallTranscription: lead.call_transcription || 'N/A',
                    VoicemailTranscription: lead.voicemail_transcription
                };
            });

            function formatDateTime(dateTime) {
                var date = new Date(dateTime);
                var options = {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    timeZone: 'America/New_York',
                    timeZoneName: 'short'
                };
                return date.toLocaleString('en-US', options);
            }

            var leadData = [];
            leadDetails.forEach(function(l , x){
                
                leadData.push(
                    {
                        id:   l.LeadID,
                        url: l.LeadURL,
                        source: l.LeadSource,
                        leadstatus: l.LeadStatus,
                        landing: l.LandingURL,
                        campaign: l.LeadCampaign,
                        key: l.LeadKeyword,
                        med: l.LeadMedium,
                        type: l.LeadType,
                        contact: l.ContactName,
                        leadnumber: l.ContactPhoneNumber || l.CallerNumber,
                        tracking: l.TrackingNumber,
                        destination: l.DestinationNumber,
                        callerCity: l.CallerCity,
                        status: l.CallStatus,
                        callZip: l.CallerZip,
                        callName: l.PhoneName,
                        duration: l.CallDuration,
                        linetype: l.LineType,
                        date: formatDateTime(l.DateCreated),
                        recording: l.PlayRecording,
                        customer: l.AdditionalFields,
                        firstname: l.AdditionalFields['First Name'],
                        lastname: l.AdditionalFields['Last Name'],
                        phone: l.AdditionalFields['Phone Number'],
                        email: l.AdditionalFields['E-mail'] || l.AdditionalFields['Email Address'],
                        address: l.AdditionalFields['Street Address'],
                        city: l.AdditionalFields['City'],
                        zip: l.AdditionalFields['Zipcode'],
                        ref: l.AdditionalFields['Who were you referred by?'],
                        job: l.AdditionalFields['projectselect'],
                        timeframe: l.AdditionalFields['Select Time Frame for Project'],
                        comments: l.AdditionalFields['Ask us any questions or send us a message'] || l.AdditionalFields['Description of Work to be Completed'],
        
                    }
                )
                
            });

            function getCurrentDateMDY() {
                var today = new Date();
                
                var month = (today.getUTCMonth() + 1).toString().padStart(2, '0'); // Months are zero-based
                var day = today.getUTCDate().toString().padStart(2, '0');
                var year = today.getUTCFullYear();
            
                return month + '/' + day + '/' + year;
            }
            
            // Example usage
            var currentDateFormat = getCurrentDateMDY();
            
            var customerData = []
            
            leadData.forEach(function(l, x){

                var leadType = l.type;

                
                

                if(leadType === 'Web Form'){

                    var newRecord = record.create({
                        type: 'customrecord_gc_what_converts_leads'
                    });

                    
                    //

                    var customer = l.customer;
                    var firstName = customer['First Name*'] || customer['First Name']
                    var lastName = customer['Last Name*'] || customer['Last Name']
                    var fullName = firstName+' '+lastName
                    var email = customer['Email Address*'] || customer['E-mail']
                    var phoneNumber = customer['Phone Number*'] || customer['Phone Number'] || customer['phone'] ||customer['Phone No*']
                    var zipCode = customer['Zipcode*'] || customer['Zipcode']
                    var streetAddress = customer['Street Address*']
                    var city = customer['City*'] || customer['Street Address']
                    var descriptionOfWork = customer['Description of Work to be Completed'] || customer['What are you looking for?*'];
                    var timeFrame = customer['Select Time Frame for Project*'] || customer['Select Time Frame for Project']
                    var jobSelect = customer['projectselect']
                    //customerData.push(fullName, email, phoneNumber, zipCode, streetAddress, city)
                    customerData.push(customer)
                   
                    //GENERAL INFOQ
                    newRecord.setValue({ fieldId: 'name', value:  l.date });
                    newRecord.setValue({ fieldId: 'custrecord_gc_wc_date', value:  currentDateFormat});

                    newRecord.setValue({ fieldId: 'custrecord_gc_wc_lead_contact_name', value:  fullName });
                    
                    newRecord.setValue({ fieldId: 'custrecord_gc_wc_lead_status', value:  l.leadstatus });
                    newRecord.setValue({ fieldId: 'custrecord_gc_wc_lead_type', value:  leadType });
                    newRecord.setValue({ fieldId: 'custrecord_gc_wc_lead_contact_number', value:  phoneNumber });
                    newRecord.setValue({ fieldId: 'custrecord_gc_wc_email', value:  email });
                    newRecord.setValue({ fieldId: 'custrecord_gc_wc_address', value:  streetAddress });
                    newRecord.setValue({ fieldId: 'custrecord_gc_wc_lead_zip', value:  zipCode });
                    newRecord.setValue({ fieldId: 'custrecord_gc_wc_lead_caller_city', value:  city });


                    //WEB LEAD
                    newRecord.setValue({ fieldId: 'custrecord_gc_wc_desc_work', value:  descriptionOfWork });
                    newRecord.setValue({ fieldId: 'custrecord_gc_wc_project_type', value:  l.job || jobSelect });
                    newRecord.setValue({ fieldId: 'custrecord_gc_wc_time_frame', value:  timeFrame });
                    newRecord.setValue({ fieldId: 'custrecord_gc_wc_lead_reference', value:  l.ref });


                    //Lead Analytics
                    newRecord.setValue({ fieldId: 'custrecord_gc_wc_lead_source', value:  l.source });
                    newRecord.setValue({ fieldId: 'custrecord_gc_wc_keyword', value:  l.key });
                    newRecord.setValue({ fieldId: 'custrecord_gc_wc_lead_id', value:  l.id });
                    newRecord.setValue({ fieldId: 'custrecord_gc_wc_medium', value:  l.med});
                    newRecord.setValue({ fieldId: 'custrecord_gc_wc_lead_url', value:  l.url });
                    newRecord.setValue({ fieldId: 'custrecord_gc_wc_landing_url', value:  l.landing });


                    try{
                        newRecord.setValue({ fieldId: 'custrecord_gc_wc_json_data', value: JSON.stringify(l) });
                    }catch(e){
                        log.debug('e', e)
                    }


                    newRecord.save();

                    
                    

                    
                    


                }

            });
            

            leadData.forEach(function(l, x){

                var leadType = l.type;

                if(leadType === 'Phone Call'){

                    var newRecord = record.create({
                        type: 'customrecord_gc_what_converts_leads'
                    });

                    
                    if(l.status === 'Completed'){
                        newRecord.setValue({ fieldId: 'custrecord_gc_wc_lead_call_recording', value:  l.recording  });

                    }

                    newRecord.setValue({ fieldId: 'name', value:  l.date });
                    newRecord.setValue({ fieldId: 'custrecord_gc_wc_date', value:  currentDateFormat});

                    newRecord.setValue({ fieldId: 'custrecord_gc_wc_lead_contact_name', value:  l.contact });
                    
                    newRecord.setValue({ fieldId: 'custrecord_gc_wc_lead_status', value:  l.leadstatus });
                    newRecord.setValue({ fieldId: 'custrecord_gc_wc_lead_type', value:  leadType });
                    newRecord.setValue({ fieldId: 'custrecord_gc_wc_lead_contact_number', value:  l.phone || l.leadnumber });
                    newRecord.setValue({ fieldId: 'custrecord_gc_wc_email', value:  l.email  });
                    newRecord.setValue({ fieldId: 'custrecord_gc_wc_address', value:  l.callName  });
                    newRecord.setValue({ fieldId: 'custrecord_gc_wc_lead_caller_city', value:  l.city || l.callerCity});
                    newRecord.setValue({ fieldId: 'custrecord_gc_wc_lead_zip', value:  l.callZip  });


                    //WEB LEAD
                    newRecord.setValue({ fieldId: 'custrecord_gc_wc_desc_work', value:  l.comments  });
                    newRecord.setValue({ fieldId: 'custrecord_gc_wc_project_type', value:  l.job  });
                    newRecord.setValue({ fieldId: 'custrecord_gc_wc_time_frame', value:  l.timeframe  });
                    newRecord.setValue({ fieldId: 'custrecord_gc_wc_lead_reference', value:  l.ref  });

                    //PHONE LEAD
                    newRecord.setValue({ fieldId: 'custrecord_gc_wc_lead_call_status', value:  l.status  });
                    newRecord.setValue({ fieldId: 'custrecord_gc_wc_lead_tracking_number', value:  l.tracking  });
                    newRecord.setValue({ fieldId: 'custrecord_gc_wc_destination_number', value:  l.destination  });
                    newRecord.setValue({ fieldId: 'custrecord_gc_wc_lead_call_duration', value:  l.duration  });
                    newRecord.setValue({ fieldId: 'custrecord_gc_wc_lead_call_line_type', value:  l.linetype  });   


                    //Lead Analytics
                    newRecord.setValue({ fieldId: 'custrecord_gc_wc_lead_source', value:  l.source  });
                    newRecord.setValue({ fieldId: 'custrecord_gc_wc_keyword', value:  l.key  });
                    newRecord.setValue({ fieldId: 'custrecord_gc_wc_lead_id', value:  l.id  });
                    newRecord.setValue({ fieldId: 'custrecord_gc_wc_medium', value:  l.med });
                    newRecord.setValue({ fieldId: 'custrecord_gc_wc_lead_url', value:  l.url  });
                    newRecord.setValue({ fieldId: 'custrecord_gc_wc_landing_url', value:  l.landing  });

                    try{
                        newRecord.setValue({ fieldId: 'custrecord_gc_wc_json_data', value:  JSON.stringify(l) });
                    }catch(e){
                        log.debug('e', e)
                    }

                    newRecord.save();

                   

                }

            });
            
            


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
