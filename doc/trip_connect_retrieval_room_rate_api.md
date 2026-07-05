# Trip.com API Documentation: Retrieval Room Rate

### **1. General API Details**
* **API Name:** Retrieval Room Rate
* **Endpoint Path:** `/cm/v4/OTA_HotelProduct`
* **Request Method:** `POST`
* **Schema Name:** `OTA_HotelProductRQ/RS`
* **Description:** Used to retrieve active RoomRates (combination of room types and rateplans) from Trip.com to map on partners' system. The roomtype ID and rateplan ID on Trip.com are the only way to identify the roomtype and rateplan in the system.
* **Pricing Model Check:** The pricing type to be sent to Trip.com is defined in the `Pricing` element within `TPA_Extensions`. During the Rate Push stage, partners must refer to this setting and push rates using the appropriate schema (e.g. Standard vs. OBP).
* **Endpoints:**
  * **Test Environment:** `https://supply-fws.ctripqa.com/cm/v4/OTA_HotelProduct`
  * **Production Environment:** `https://supply.ctrip.com/cm/v4/OTA_HotelProduct`

---

### **2. Request Parameters (`OTA_HotelProductRQ`)**

| Element / Attribute | Requirement | Type | Description |
| :--- | :--- | :--- | :--- |
| **`OTA_HotelProductRQ`** | Required | Element | Root element of the request |
| `Version` | Required | Attribute | The Trip.com API version used by the partner. Default: `4.0` |
| `PrimaryLangID` | Required | Attribute | The language of the text in request. Default: `en-us` |
| `TimeStamp` | Required | Attribute | The timestamp of this request |
| **`HotelProducts`** | Required | Element | Contains the property id |
| **`HotelProduct`** | Required | Element | Wrapper element for property code |
| `HotelCode` | Required | Attribute | Trip.com property ID |

---

### **3. Response Parameters (`OTA_HotelProductRS`)**

| Element / Attribute | Requirement | Type | Description |
| :--- | :--- | :--- | :--- |
| **`OTA_HotelProductRS`** | Required | Element | Root element of the response |
| `Version` | Required | Attribute | The Trip.com API version used by the partner. Default: `4.0` |
| `PrimaryLangID` | Required | Attribute | The language of the text in response. Default: `en-us` |
| `TimeStamp` | Required | Attribute | The timestamp of this response |
| **`Success`** | Optional | Element | Present if the request is processed successfully |
| **`Errors`** | Optional | Element | Wrapper element present if request processing fails |
| **`Error`** | Optional | Attribute | Details of the processing failure |
| `Type` | Optional | Attribute | Error type |
| `ShortText` | Optional | Attribute | Refer to Product Retrieval Error Code in the Appendix |
| `Code` | Optional | Attribute | Refer to Product Retrieval Error Code in the Appendix |
| **`HotelProducts`** | Optional | Element | Contains the hotel’s active products |
| `HotelCode` | Required | Attribute | Trip.com property id |
| **`RatePlan`** | Optional | Element | Contains the hotel’s active rateplan |
| `RatePlanCode` | Required | Attribute | Trip.com rateplan id |
| `RatePlanName` | Required | Attribute | Trip.com rateplan name |
| `PaymentCollection` | Required | Attribute | Indicates payment collector. Values: `HotelCollect` (pay at hotel); `TripCollect` (Trip.com collect prepay) |
| **`RoomType`** | Optional | Element | Contains the hotel’s roomtype |
| `RoomTypeCode` | Required | Attribute | Trip.com roomtype id |
| `RoomTypeName` | Required | Attribute | Trip.com roomtype name |
| `MaxOccupancy` | Required | Attribute | Maximum number of guests allowed. Limit on the sum of adult and child occupants |
| `MaxAdultOccupancy` | Required | Attribute | Maximum number of adults allowed. Max: 99 |
| `MaxChildOccupancy` | Required | Attribute | Maximum number of children allowed. Max: 6 |
| **`TPA_Extensions`** | Required | Element | Extensibility container |
| **`Pricing`** | Required | Element | Pricing config wrapper |
| `Type` | Required | Attribute | Pricing model of the property. Values: `Standard`, `OBP` |

---

### **4. Request XML Structure (Sample)**
```xml
<OTA_HotelProductRQ Version="4.0" PrimaryLangID="en-us" TimeStamp="2021-10-17T09:30:47Z" xmlns="http://www.opentravel.org/OTA/2003/05">
    <POS>
        <Source>
            <RequestorID ID="CMtest" Type="1" MessagePassword="123qza">
                <CompanyName Code="C" CodeContext="600"/>
            </RequestorID>
        </Source>
    </POS>
    <HotelProducts>
        <HotelProduct HotelCode="5451622"/>
    </HotelProducts>
</OTA_HotelProductRQ>
```

---

### **5. Response XML Structure (Success Sample)**
```xml
<OTA_HotelProductRS Version="4.0" PrimaryLangID="en-us" TimeStamp="2021-10-17T15:14:38.9297691+08:00" xmlns="http://www.opentravel.org/OTA/2003/05">
    <Success/>
    <HotelProducts HotelCode="5451622">
        <HotelProduct>
            <RoomTypes>
                <RoomType RoomTypeCode="105896445" RoomTypeName="Standard Room" MaxOccupancy="4" MaxAdultOccupancy="3" MaxChildOccupancy="2"/>
            </RoomTypes>
            <RatePlans>
                <RatePlan RatePlanCode="1894567" RatePlanName="Best Available Rate" PaymentCollection="HotelCollect"/>
            </RatePlans>
        </HotelProduct>
        <HotelProduct>
            <RoomTypes>
                <RoomType RoomTypeCode="105896445" RoomTypeName="Standard Room" MaxOccupancy="4" MaxAdultOccupancy="3" MaxChildOccupancy="2"/>
            </RoomTypes>
            <RatePlans>
                <RatePlan RatePlanCode="1894568" RatePlanName="Last Minute Rate" PaymentCollection="TripCollect"/>
            </RatePlans>
        </HotelProduct>
    </HotelProducts>
    <TPA_Extensions>
        <Pricing Type="OBP"/>
    </TPA_Extensions>
</OTA_HotelProductRS>
```

---

### **6. Response XML Structure (Failure / Error Sample)**
```xml
<OTA_HotelProductRS Version="4.0" PrimaryLangID="en-us" TimeStamp="2021-10-17T15:14:38.9297691+08:00" xmlns="http://www.opentravel.org/OTA/2003/05">
    <Errors>
        <Error Type="3" ShortText="Invalid hotel code" Code="392"/>
    </Errors>
</OTA_HotelProductRS>
```
