# Availability and Inventory API

**Path:** `/cm/v4/OTA_HotelAvailNotif`

This API is used to push availability and inventory data to [Trip.com](http://Trip.com) . It supports returning the actual processing results. A successful response indicates that [Trip.com](http://Trip.com) has successfully processed and stored the availability and inventory information. In case of errors, you can implement a retry mechanism based on the specific error types.

### For API calls

* Request Method: POST
* Schema Name: OTA_HotelAvailNotifRQ/RS
* API Calls: Partners
* API Response:[Trip.com](http://Trip.com)

### Endpoint URLs

* Test environment:[https://supply-fws.ctripqa.com/cm/v4/OTA_HotelAvailNotif](https://supply-fws.ctripqa.com/cm/v4/OTA_HotelAvailNotif)
* Production environment:[https://supply.ctrip.com/cm/v4/OTA_HotelAvailNotif](https://supply.ctrip.com/cm/v4/OTA_HotelAvailNotif)

### Request body example

#### Example 1

Push daily availability and inventory (room type level inventory)

```xml
<OTA_HotelAvailNotifRQ xmlns="http://www.opentravel.org/OTA/2003/05" PrimaryLangID="en-us" TimeStamp="2021-10-09T13:41:31Z" Version="4.0">
    <POS>
        <Source>
            <RequestorID ID="CMtest" MessagePassword="123qaz" Type="1">
                <CompanyName Code="C" CodeContext="60061"/>
            </RequestorID>
        </Source>
    </POS>
    <AvailStatusMessages HotelCode="59394">
        <AvailStatusMessage BookingLimitMessageType="SetLimit" BookingLimit="10">
            <StatusApplicationControl Start="2021-10-09" End="2021-10-20" InvTypeCode="10011"/>
        </AvailStatusMessage>
        <AvailStatusMessage>
            <StatusApplicationControl Start="2021-10-09" End="2021-10-20" InvTypeCode="10011" RatePlanCode="1894567"/>
            <RestrictionStatus Status="Open"/>
        </AvailStatusMessage>
        <AvailStatusMessage>
            <StatusApplicationControl Start="2021-10-09" End="2021-10-20" InvTypeCode="10011" RatePlanCode="1894000"/>
            <RestrictionStatus Status="Open"/>
        </AvailStatusMessage>
    </AvailStatusMessages>
</OTA_HotelAvailNotifRQ>
```

#### Example 2

Push restrictions only

```xml
<OTA_HotelAvailNotifRQ xmlns="http://www.opentravel.org/OTA/2003/05" PrimaryLangID="en-us" TimeStamp="2021-10-09T13:41:31Z" Version="4.0">
    <POS>
        <Source>
            <RequestorID ID="CMtest" MessagePassword="123qaz" Type="1">
                <CompanyName Code="C" CodeContext="60061"/>
            </RequestorID>
        </Source>
    </POS>
    <AvailStatusMessages HotelCode="59394">

        <!-- same product same date, different restrictions -->
        <AvailStatusMessage>
            <StatusApplicationControl Start="2021-10-09" End="2021-10-20" InvTypeCode= “10011” RatePlanCode="1894567"/>
            <RestrictionStatus Restriction="Arrival" Status="Close"/>
        </AvailStatusMessage>
        <AvailStatusMessage>
            <StatusApplicationControl Start="2021-10-21" End="2021-10-31" InvTypeCode= “10011” RatePlanCode="1894567"/>
            <RestrictionStatus Restriction="Departure" Status="Close"/>
        </AvailStatusMessage>

        <!-- same date, same restriction, different products -->
        <AvailStatusMessage>
            <StatusApplicationControl Start="2021-11-01" End="2021-11-09" InvTypeCode= “10011” RatePlanCode="2587458"/>
            <RestrictionStatus Restriction="Departure" Status="Close"/>
        </AvailStatusMessage>
        <AvailStatusMessage>
            <StatusApplicationControl Start="2021-11-01" End="2021-11-09" InvTypeCode= “10011” RatePlanCode="2587457"/>
            <RestrictionStatus Restriction="Departure" Status="Close"/>
        </AvailStatusMessage>

        <!-- same product, different dates and restrictions -->
        <AvailStatusMessage>
            <StatusApplicationControl Start="2021-11-10" End="2021-11-20" InvTypeCode= “10011” RatePlanCode="2587458"/>
            <LengthsOfStay>
                <LengthOfStay MinMaxMessageType="SetMinLOS" Time="3" TimeUnit="Day"/>
                <LengthOfStay MinMaxMessageType="SetMaxLOS" Time="5" TimeUnit="Day"/>
                <LengthOfStay MinMaxMessageType="SetMinLOS_Through" Time="3" TimeUnit="Day" />
                <LengthOfStay MinMaxMessageType="SetMaxLOS_Through" Time="10" TimeUnit="Day" />
            </LengthsOfStay>
        </AvailStatusMessage>
        <AvailStatusMessage>
            <StatusApplicationControl Start="2021-11-21" End="2021-11-30" InvTypeCode= “10011” RatePlanCode="2587458"/>
            <LengthsOfStay>
                <LengthOfStay MinMaxMessageType="SetMinLOS" Time="2" TimeUnit="Day"/>
                <LengthOfStay MinMaxMessageType="SetMaxLOS" Time="5" TimeUnit="Day"/>
                <LengthOfStay MinMaxMessageType="SetMinLOS_Through" Time="3" TimeUnit="Day" />
                <LengthOfStay MinMaxMessageType="SetMaxLOS_Through" Time="10" TimeUnit="Day" />
            </LengthsOfStay>
        </AvailStatusMessage>
        <AvailStatusMessage>
            <StatusApplicationControl Start="2021-12-01" End="2021-12-12" InvTypeCode= “10011” RatePlanCode="2587458"/>
            <LengthsOfStay>
                <LengthOfStay MinMaxMessageType="SetMinLOS" Time="2" TimeUnit="Day"/>
                <LengthOfStay MinMaxMessageType="SetMaxLOS" Time="7" TimeUnit="Day"/>
                <LengthOfStay MinMaxMessageType="SetMinLOS_Through" Time="3" TimeUnit="Day" />
                <LengthOfStay MinMaxMessageType="SetMaxLOS_Through" Time="10" TimeUnit="Day" />
            </LengthsOfStay>
        </AvailStatusMessage>

        <!-- different products, dates and restrictions -->
        <AvailStatusMessage>
            <StatusApplicationControl Start="2021-12-13" End="2021-12-20" InvTypeCode= “10011” RatePlanCode="1894567"/>
            <LengthsOfStay>
                <LengthOfStay MinMaxMessageType="SetMaxLOS" Time="6" TimeUnit="Day"/>
            </LengthsOfStay>
        </AvailStatusMessage>
        <AvailStatusMessage>
            <StatusApplicationControl Start="2021-12-21" End="2021-12-31" InvTypeCode= “10011” RatePlanCode="1794458"/>
            <RestrictionStatus MinAdvancedBookingOffset="P3D" />
        </AvailStatusMessage>
    </AvailStatusMessages>
</OTA_HotelAvailNotifRQ>
```

#### Example 3

Push multiple status (case 1+case 2)

```xml
<OTA_HotelAvailNotifRQ xmlns="http://www.opentravel.org/OTA/2003/05" PrimaryLangID="en-us" TimeStamp="2021-10-09T13:41:31Z" Version="4.0">
    <POS>
        <Source>
            <RequestorID ID="CMtest" MessagePassword="123qaz" Type="1">
                <CompanyName Code="C" CodeContext="60061"/>
            </RequestorID>
        </Source>
    </POS>
    <AvailStatusMessages HotelCode="59394">
        <AvailStatusMessage BookingLimitMessageType="SetLimit" BookingLimit="10">
            <StatusApplicationControl Start="2021-10-09" End="2021-10-12" InvTypeCode= “10011” />
        </AvailStatusMessage>
        <AvailStatusMessage >
            <StatusApplicationControl Start="2021-10-09" End="2021-10-20" InvTypeCode= “10011” RatePlanCode="1894567"/>
            <RestrictionStatus Status="Open"/>
        </AvailStatusMessage>
        <AvailStatusMessage >
            <StatusApplicationControl Start="2021-10-21" End="2021-10-31" InvTypeCode= “10011” RatePlanCode="2587458"/>
            <RestrictionStatus Status="Close"/>
        </AvailStatusMessage>
        <AvailStatusMessage >
            <StatusApplicationControl Start="2021-11-01" End="2021-11-10" InvTypeCode= “10011” RatePlanCode="2587458"/>
            <RestrictionStatus Status="Open"/>
        </AvailStatusMessage>
        <AvailStatusMessage >
            <StatusApplicationControl Start="2021-11-11" End="2021-11-15" InvTypeCode= “10011” RatePlanCode="2587458"/>
            <RestrictionStatus Status="Open"/>
        </AvailStatusMessage>
        <AvailStatusMessage>
            <StatusApplicationControl Start="2021-11-16" End="2021-11-26" InvTypeCode= “10011” RatePlanCode="1894567"/>
            <LengthsOfStay>
                <LengthOfStay MinMaxMessageType="SetMaxLOS" Time="5" TimeUnit="Day" />
                <LengthOfStay MinMaxMessageType="SetMinLOS_Through" Time="3" TimeUnit="Day" />
            </LengthsOfStay>
        </AvailStatusMessage>
        <AvailStatusMessage>
            <StatusApplicationControl Start="2021-11-27" End="2021-11-30" InvTypeCode= “10011” RatePlanCode="1894567"/>
            <LengthsOfStay>
                <LengthOfStay MinMaxMessageType="SetMaxLOS" Time="5" TimeUnit="Day" />
                <LengthOfStay MinMaxMessageType="SetMinLOS_Through" Time="3" TimeUnit="Day" />
            </LengthsOfStay>
        </AvailStatusMessage>
    </AvailStatusMessages>
</OTA_HotelAvailNotifRQ>
```
