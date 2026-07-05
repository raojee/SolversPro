# Rates API Documentation

**Path:** CM OpenTravel API > Rates & Availability > Rates

## Rates API
**Endpoint:** `/cm/v4/OTA_HotelRateAmountNotif`

This API is used for updating rates. It is recommended to initially push the complete set of rates upon the first connection, followed by incremental updates. The interface supports returning processing results from the [Trip.com](http://Trip.com) system. A successful response indicates that [Trip.com](http://Trip.com) has successfully processed and stored the room rate information you provided. In case of errors, you can implement a retry mechanism based on the specific error types.

### For API calls
* **Request Method:** POST
* **Schema Name:** OTA_HotelRateAmountNotifRQ/RS
* **API Calls:** Partners
* **API Response:** [Trip.com](http://Trip.com)

### Endpoint URLs
* **Test environment:** `https://supply-fws.ctripqa.com/cm/v4/OTA_HotelRateAmountNotif`
* **Production environment:** `https://supply.ctrip.com/cm/v4/OTA_HotelRateAmountNotif`

### Pricing type
The pricing type or model can be set up at a property level in [Trip.com](http://Trip.com) extranet. We have following two types of pricing models:

#### Per Room Pricing
Specify a price regardless of how many people are accommodated in the room (within its maximum occupancy)

**Use case - Push rate for a per room pricing model rateplan**
```xml
<OTA_HotelRateAmountNotifRQ Version="4.0" PrimaryLangID="en-us" TimeStamp="2021-10- 10T09:30:47Z" xmlns="http://www.opentravel.org/OTA/2003/05">
    <POS>
     <Source>
      <RequestorID ID="CityHall" MessagePassword="123qaz" Type="1">
       <CompanyName Code="C" CodeContext="60061"/>
      </RequestorID>
     </Source>
    </POS>
    <RateAmountMessages HotelCode="54394">
     <RateAmountMessage>
      <StatusApplicationControl InvTypeCode="10589645" RatePlanCode="1894567"/>
      <Rates>
       <Rate Start="2021-10-19" End="2021-11-20">
        <BaseByGuestAmts>
         <BaseByGuestAmt AmountAfterTax="120" CurrencyCode="USD"/>
        </BaseByGuestAmts>
       </Rate>
      </Rates>
     </RateAmountMessage>
    <RateAmountMessage>
     <StatusApplicationControl InvTypeCode="10589645" RatePlanCode="1894568" />
     <Rates>
       <Rate Start="2021-10-19" End="2021-11-20">
        <BaseByGuestAmts>
         <BaseByGuestAmt AmountAfterTax="200" CurrencyCode="USD"/>
        </BaseByGuestAmts>
       </Rate>
     </Rates>
    </RateAmountMessage>
   </RateAmountMessages>
</OTA_HotelRateAmountNotifRQ>
```

#### Occupancy Based Pricing(OBP)
Specify a price based on number of occupants, room type, rate plan and date

**Use case - Push rate for an occupancy based pricing model rateplan**
```xml
<OTA_HotelRateAmountNotifRQ Version="4.0" PrimaryLangID="en-us" TimeStamp="2021-10-10T09:30:47Z" xmlns="http://www.opentravel.org/OTA/2003/05">
    <POS>
     <Source>
     <RequestorID ID="CityHall" MessagePassword="123qaz" Type="1">
       <CompanyName Code="C" CodeContext="60061"/>
      </RequestorID>
     </Source>
    </POS>
    <RateAmountMessages HotelCode="8379298">
     <RateAmountMessage>
      <StatusApplicationControl InvTypeCode="10589645" RatePlanCode="1894567"/>
       <Rates>
        <Rate Start="2021-10-19" End="2021-11-20">
         <BaseByGuestAmts>
          <BaseByGuestAmt NumberOfGuests="1" AmountAfterTax="107" CurrencyCode="AUD"/>
          <BaseByGuestAmt NumberOfGuests="2" AmountAfterTax="150" CurrencyCode="AUD"/>
          <BaseByGuestAmt NumberOfGuests="3" AmountAfterTax="210" CurrencyCode="AUD"/>
         </BaseByGuestAmts>    
        </Rate>
       </Rates>
      </RateAmountMessage>
     </RateAmountMessages>
</OTA_HotelRateAmountNotifRQ>
```
