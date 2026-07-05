# Rates and Availability Retrieval API

**Path:** `/cm/v4/HotelAvailRateRetrieval`

This API is used to retrieve current availability and rate details for a given date range and product(s).

## For API calls
- **Request Method:** `POST`
- **Schema Name:** `HotelAvailRateRetrievalRQ/RS`
- **API Calls:** Partners
- **API Response:** Trip.com

## Endpoint URLs
- **Test environment:** `https://supply-fws.ctripqa.com/cm/v4/HotelAvailRateRetrieval`
- **Production environment:** `https://supply.ctrip.com/cm/v4/HotelAvailRateRetrieval`

---

## API Specifications

### Headers
- `Content-Type`: `application/xml`
- `Accept`: `*/*`
- `Authorization`: Not required

### Request Schema
- **HotelAvailRateRetrievalRQ** (`Element`, *Required*): Root element
  - **Version** (`Attribute`, *Required*): The Trip.com API version used by the partner. The default value is 4.0
  - **PrimaryLangID** (`Attribute`, *Required*): The language of the text in request. The default value is `en-us`
  - **TimeStamp** (`Attribute`, *Required*): The timestamp of this request
  - **Hotel** (`Element`, *Required*): Hotel element
    - **ID** (`Attribute`, *Required*): Trip.com property ID
  - **AvailRateRetrieval** (`Element`, *Required*): Query criteria container
    - **StartDate** (`Attribute`, *Required*): The start date of the date range that the response must cover
    - **EndDate** (`Attribute`, *Required*): The end date of the date range that the response must cover
    - **RoomType** (`Element`, *Optional*): If specified, the request will return availability and rates data for specific room type(s) and related product(s).
      - **ID** (`Attribute`, *Required*): Trip.com RoomType ID
      - **RatePlan** (`Element`, *Required*): If specified, the request will return availability and rates data for specific room type(s) and related product(s).
        - **ID** (`Attribute`, *Required*): Trip.com RatePlan ID.

### Response Schema
- **HotelAvailRateRetrievalRS** (`Element`, *Required*): Root element
  - **Version** (`Attribute`, *Required*): The Trip.com API version used by the partner. The default value is 4.0
  - **PrimaryLangID** (`Attribute`, *Required*): The language of the text in response. The default value is `en-us`
  - **TimeStamp** (`Attribute`, *Required*): The timestamp of this response
  - **Success** (`Element`, *Optional*): If the request is processed successfully, this element will appear in the response
  - **Errors** (`Element`, *Optional*): If the request processing fails, this element will appear in the response
    - **Error** (`Element`, *Optional*): Error details
      - **Type** (`Attribute`, *Optional*): Refer to Product Retrieval Error Code in the Appendix
      - **ShortText** (`Attribute`, *Optional*): Refer to Product Retrieval Error Code in the Appendix
      - **Code** (`Attribute`, *Optional*): Refer to Product Retrieval Error Code in the Appendix
  - **AvailRateList** (`Element`, *Optional*): Contains availability and rates data of the product(s) requested
    - **Hotel** (`Element`, *Required*): Hotel identifier
      - **ID** (`Attribute`, *Required*): Trip.com property ID
      - **PricingType** (`Attribute`, *Required*): The pricing model of the property. Possible values: `[OBP]`, `[Standard]`
    - **AvailRate** (`Element`, *Optional*): Grouping of availability and rates data for the date range requested. One grouping will contain all products requested
      - **StartDate** (`Attribute`, *Required*): The start date of the date range
      - **EndDate** (`Attribute`, *Required*): The end date of the date range
      - **RoomType** (`Element`, *Optional*): Room type details
        - **ID** (`Attribute`, *Required*): Trip.com roomtype ID
        - **TotalInvCount** (`Attribute`, *Optional*): Only returned if the inventory data is set up
        - **RatePlan** (`Element`, *Optional*): Rate plan details
          - **ID** (`Attribute`, *Required*): Trip.com rateplan ID
          - **RoomRate** (`Element`, *Optional*): Room rate details
            - **CurrencyCode** (`Attribute`, *Required*): Currency
            - **Closed** (`Attribute`, *Optional*): Roomrate(product) availability status. Possible values: `T`(bookable); `F`(closed for sales)
            - **Rate** (`Element`, *Optional*): Rate details
              - **Amount** (`Attribute`, *Required*): For an `[OBP]` property, the rate per occupancy will be returned. For a `[Standard]` property, the rate for the room will be returned together with the maximum occupancy
              - **Occupancy** (`Attribute`, *Required*): Occupancy applicable to the attached Amount
          - **Restrictions** (`Element`, *Optional*): Restrictions
            - **ClosedToArrival** (`Attribute`, *Optional*): Only returned if the CTA is set up. Possible values: `T`(available for check-in); `F`(unavailable for check-in)
            - **ClosedToDeparture** (`Attribute`, *Optional*): Only returned if the CTD is set up. Possible values: `T`(available for check-out); `F`(unavailable for check-out)
            - **MinLOS** (`Attribute`, *Optional*): Minimum Length of Stay
            - **MaxLOS** (`Attribute`, *Optional*): Maximum Length of Stay
            - **MinLOS_Through** (`Attribute`, *Optional*): Minimum days before booking
            - **MaxLOS_Through** (`Attribute`, *Optional*): Maximum days before booking

---

## Request Body Examples

### Example 1: Retrieve availability and rates of all valid product(s) under a hotel
```xml
<HotelAvailRateRetrievalRQ Version="4.0" PrimaryLangID="en-us" TimeStamp="2023-01-10T13:39:47Z" xmlns="http://www.opentravel.org/OTA/2003/05">
    <POS>
        <Source>
            <RequestorID ID="CMtest" MessagePassword="123qaz" Type="1">
                <CompanyName Code="C" CodeContext="60061"/>
            </RequestorID>
        </Source>
    </POS>
    <Hotel ID="54394"/>
    <AvailRateRetrieval StartDate="2023-02-20" EndDate="2023-02-23">
    </AvailRateRetrieval>
</HotelAvailRateRetrievalRQ>
```

### Example 2: Retrieve availability and rates of specific product(s) under a hotel
```xml
<HotelAvailRateRetrievalRQ Version="4.0" PrimaryLangID="en-us" TimeStamp="2023-01-10T13:39:47Z" xmlns="http://www.opentravel.org/OTA/2003/05">
    <POS>
        <Source>
            <RequestorID ID="CMtest" MessagePassword="123qaz" Type="1">
                <CompanyName Code="C" CodeContext="60061"/>
            </RequestorID>
        </Source>
    </POS>
    <Hotel ID="38817757"/>
    <AvailRateRetrieval StartDate="2023-02-20" EndDate="2023-02-23">
        <RoomType ID="12345">
            <RatePlan ID="24678" />
        </RoomType>
        <RoomType ID="12345">
            <RatePlan ID="24689" />
        </RoomType>
    </AvailRateRetrieval>
</HotelAvailRateRetrievalRQ>
```

---

## Response Body Examples

### Example 1: Return availability and rates data of a “OBP” pricing model hotel successfully
```xml
<HotelAvailRateRetrievalRS Version="4.0" PrimaryLangID="en-us" TimeStamp="2001-12-17T15:14:38.9297691+08:00" xmlns="http://www.opentravel.org/OTA/2003/05">
    <Success/>
    <AvailRateList>
        <Hotel ID="54394" PricingType="OBP"></Hotel>
        <AvailRate StartDate="2023-02-20" EndDate="2023-02-23">
            <RoomType ID="200289219" TotalInvCount="18">
                <RatePlan ID="201725215">
                    <RoomRate CurrencyCode="USD" Closed="F">
                        <Rate Amount="138" Occupancy="1" />
                        <Rate Amount="188" Occupancy="2" />
                        <Rate Amount="240" Occupancy="3" />
                    </RoomRate>
                    <Restrictions ClosedToArrival="T" ClosedToDeparture="F" MinLOS="3" MaxLOS="5" MinLOS_Through="3" MaxLOS_Through="10" MinAdvanceBookingOffset="3" MaxAdvanceBookingOffset="30" />
                </RatePlan>
            </RoomType>
        </AvailRate>
    </AvailRateList>
</HotelAvailRateRetrievalRS>
```

### Example 2: Return availability and rates data of a “Standard” pricing model hotel successfully
```xml
<HotelAvailRateRetrievalRS Version="4.0" PrimaryLangID="en-us" TimeStamp="2021-12-17T15:14:38.9297691+08:00" xmlns="http://www.opentravel.org/OTA/2003/05">
    <Success/>
    <AvailRateList>
        <Hotel ID="54394" PricingType="Standard"></Hotel>
        <AvailRate StartDate="2022-11-13" EndDate="2022-11-30">
            <RoomType ID="200289219" TotalInvCount="18">
                <RatePlan ID="201725215" >
                    <RoomRate CurrencyCode="USD" Closed="F">
                        <Rate Amount="300" Occupancy="3" />
                    </RoomRate>
                    <Restrictions ClosedToArrival="T" ClosedToDeparture="F" MinLOS="3" MaxLOS="5" MinLOS_Through="3" MaxLOS_Through="10" MinAdvanceBookingOffset="3" MaxAdvanceBookingOffset="30" />
                </RatePlan>
            </RoomType>
        </AvailRate>
    </AvailRateList>
</HotelAvailRateRetrievalRS>
```

### Response Failure Sample
```xml
<HotelAvailRateRetrievalRS Version="4.0" PrimaryLangID="en-us" TimeStamp="2025-01-14T07:33:25.663+08:00" xmlns="http://www.opentravel.org/OTA/2003/05">
    <Errors>
        <Error Type="3" Code="392">Invalid hotel code</Error>
    </Errors>
</HotelAvailRateRetrievalRS>
```
