// import { HttpClient, HttpClientResponse } from "@microsoft/sp-http";

// export default class KycService {
//   private _httpClient: HttpClient;
//   private _apiUrl: string = "https://uat.princepipes.com:567/api/CustomerKYC/getCustomerKYCDetails";

//   constructor(httpClient: HttpClient) {
//     this._httpClient = httpClient;
//   }

//   public async getCustomerKYCDetails(data: any): Promise<any> {
//     const response: HttpClientResponse = await this._httpClient.post(
//       this._apiUrl,
//       HttpClient.configurations.v1,
//       {
//         headers: new Headers({
//           "Content-Type": "application/json",
//           "Accept": "application/json",
//         }),
//         body: JSON.stringify(data)
//       }
//     );

//     // If API returns array or object – adjust accordingly
//     return response.json();
//   }
// }


import { HttpClient, HttpClientResponse } from "@microsoft/sp-http";

export default class KycService {
  private _httpClient: HttpClient;


  constructor(httpClient: HttpClient) {
    this._httpClient = httpClient;
  }

  public async getCustomerKYCDetails(data: any,_apiUrl:any): Promise<any> {
    // Convert JSON to form-urlencoded string
    const formBody = Object.keys(data)
      .map(key => encodeURIComponent(key) + "=" + encodeURIComponent(data[key]))
      .join("&");

    const response: HttpClientResponse = await this._httpClient.post(
      _apiUrl,
      HttpClient.configurations.v1,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Accept": "application/json",
        },
        body: formBody
      }
    );

    return response.json();
  }

  // New method to update KYC details
public async updateCustomerKYCDetails(data: any, _apiUrl: string): Promise<any> {
 
  const body = new URLSearchParams();
 
  for (const key in data) {
    if (key !== "blankCheque") {   // <-- remove unwanted param
      body.append(key, data[key]);
    }
  }
 
  const response = await this._httpClient.post(
    _apiUrl,
    HttpClient.configurations.v1,
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json",
      },
      body: body.toString()
    }
  );
 
  return response.json();
}

  // New method to approve KYC
  public async approveCustomerKYCDetails(data: any, _apiUrl: string): Promise<any> {
    const formBody = Object.keys(data)
      .map(key => encodeURIComponent(key) + "=" + encodeURIComponent(data[key]))
      .join("&");

    const response: HttpClientResponse = await this._httpClient.post(
      _apiUrl,
      HttpClient.configurations.v1,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Accept": "application/json",
        },
        body: formBody
      }
    );

    return response.json();
  }

  // New method to reject KYC
  public async rejectCustomerKYCDetails(data: any, _apiUrl: string): Promise<any> {
    const formBody = Object.keys(data)
      .map(key => encodeURIComponent(key) + "=" + encodeURIComponent(data[key]))
      .join("&");

    const response: HttpClientResponse = await this._httpClient.post(
      _apiUrl,
      HttpClient.configurations.v1,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Accept": "application/json",
        },
        body: formBody
      }
    );

    return response.json();
  }

  // New method to update SHPID
  public async updateSHPID(data: any, _apiUrl: string): Promise<any> {
    const formBody = Object.keys(data)
      .map(key => encodeURIComponent(key) + "=" + encodeURIComponent(data[key]))
      .join("&");

    const response: HttpClientResponse = await this._httpClient.post(
      _apiUrl,
      HttpClient.configurations.v1,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Accept": "application/json",
        },
        body: formBody
      }
    );

    return response.json();
  }

  // New method to update SHPID
  public async createCustomerInNavision(_apiUrl: string): Promise<any> {
    // const formBody = Object.keys(data)
    //   .map(key => encodeURIComponent(key) + "=" + encodeURIComponent(data[key]))
    //   .join("&");
  
    try {
      const response: HttpClientResponse = await this._httpClient.get(
        _apiUrl,
        HttpClient.configurations.v1,
        // {
        //   headers: {
        //     "Content-Type": "application/x-www-form-urlencoded", // Content type for form data
        //     "Accept": "application/json", // Expected response type
        //   },
        //   body: formBody, // The actual body data to send
        // }
      );
  
      const responseData = await response.json();
  
      // Handle response or check for specific result/error
      if (responseData?.Result === 'Failed') {
        throw new Error('Server Busy!!');
      }
  
      return responseData;
  
    } catch (error) {
      console.error('Error updating customer in Navision:', error);
      throw error; // Re-throw the error for further handling at the call site
    }
  }

  // Async method for handling the GET request to fetch pin code data
  public async fetchPinCodeData(_apiUrl: string): Promise<any> {
    //const apiUrl = `https://uat.princepipes.com:446/wsVendorDetails.asmx/getPinCode?PinCode=${pinCode}`;
  
    try {
      // Make the GET request using HttpClient
      const response: HttpClientResponse = await this._httpClient.get(
        _apiUrl,
        HttpClient.configurations.v1,
        {
          headers: {
            "Accept": "application/json",
          },
        }
      );
  
      // Parse and return the JSON response
      const responseData = await response.json();
  
      // Handle response or check for specific result/error
      if (responseData?.Result === 'Failed') {
        throw new Error('Server Busy!!');
      }
  
      return responseData;
    } catch (error) {
      // Log any error that occurs
      console.error('Error fetching pin code data:', error);
      throw error;  // Rethrow error to be handled by the calling method
    }
  }
  

  
}
