# Rates & Availability API Overview

The Availability and Rates API is an interface that allows you to update your rates, inventory and availability on [Trip.com](http://Trip.com).

### Features

Use Rates & Availability API to:
* Automatically update rates and availability
* Enable restrictions, including closed-to-arrival or departure and minimum/maximum lengths of stay
* Reduce manual tasks and maintain up-to-date inventory

### Rates, inventory and availability

* **Rates:** Room rate refers to the price at which a hotel sells its rooms via a channel ([Trip.com](http://Trip.com))
* **Inventory:** Inventory is the number of rooms a property sells via a channel ([Trip.com](http://Trip.com))
* **Availability:** Availability is what is available to buy at a given time depending on the guest’s set of search criteria, and includes applicable rate plans, stay restrictions, and other related information.

### ARI Bulk Update - Push Message Best Practices

For optimal ARI update performance, follow these guidelines when creating bulk update push messages:
* Include a maximum of 1 month of dates per message to ensure efficient processing.
* Multiple room rates can be included within a single message.

This approach optimizes message processing and system performance.

### Pricing Types on [Trip.com](http://Trip.com)

The [Trip.com](http://Trip.com) API supports the following three pricing types:
* Standard: Per room pricing or derived rate setting. (In the derived rate setting, rates are updated based on base rates, and other rates are calculated using a fixed formula in the [Trip.com](http://Trip.com) Extranet.)
* OBP(Occupancy-Based Pricing): Pricing per guest, allowing customization of rates for each occupancy level.

The pricing type on [Trip.com](http://Trip.com) can be identified through the Products retrieval. After consultation between the hotel and the [Trip.com](http://Trip.com) operator, if the pricing type is set in the Extranet, the partner’s system can query the pricing type via Products retrieval and push rates accordingly.

![Pricing Type](http://file.c-ctrip.com/files/6/selfservice/0M60r12000ibc383a23BB.png)

#### Sample - Products retrieval

```xml
<OTA_HotelProductRS Version="4.0" PrimaryLangID="en-us" TimeStamp="2021-10-17T15:14:38.9297691+08:00"
    xmlns="http://www.opentravel.org/OTA/2003/05">
    <Success />
    <HotelProducts HotelCode="5451622">
        <HotelProduct>
            <RoomTypes>
                <RoomType RoomTypeCode="105896445" RoomTypeName="Standard Room" MaxOccupancy="4" MaxAdultOccupancy="3" MaxChildOccupancy="2" />
            </RoomTypes>
            <RatePlans>
                <RatePlan RatePlanCode="1894567" RatePlanName="Best Available Rate" PaymentCollection="HotelCollect" />
            </RatePlans>
        </HotelProduct>
    </HotelProducts>
    <TPA_Extensions>
        <!-- Pricing Type -->
        <Pricing Type="OBP" />
        <!-- //Pricing Type -->
    </TPA_Extensions>
</OTA_HotelProductRS>
```

The schema for Rate Push varies for each pricing type.

For the Standard type, rates can be pushed per room based on specific criteria.

#### Sample - Standard

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
</OTA_HotelRateAmountNotifRQ>
```

For the OBP type, rates can be pushed per guest based on specific criteria. The number of guests pushed cannot exceed the MaxAdultOccupancy provided by the product retrieval API.

#### Sample - OBP

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
