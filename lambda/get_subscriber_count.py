import json
import os
import urllib.request
import urllib.error
import base64

def lambda_handler(event, context):
    try:
        # Get environment variables
        api_key = os.environ.get("MAILCHIMP_API_KEY")
        server_prefix = os.environ.get("MAILCHIMP_SERVER_PREFIX")
        list_id = os.environ.get("MAILCHIMP_LIST_ID")
        
        if not all([api_key, server_prefix, list_id]):
            return {
                "statusCode": 500,
                "headers": {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*"
                },
                "body": json.dumps({
                    "error": "Missing required environment variables",
                    "message": "MAILCHIMP_API_KEY, MAILCHIMP_SERVER_PREFIX, and MAILCHIMP_LIST_ID must be set",
                    "success": False
                })
            }
        
        # Prepare the API request
        url = f"https://{server_prefix}.api.mailchimp.com/3.0/lists/{list_id}"
        
        # Create Basic Auth header
        auth_string = f"anystring:{api_key}"
        auth_bytes = auth_string.encode('ascii')
        auth_b64 = base64.b64encode(auth_bytes).decode('ascii')
        
        # Create the request
        req = urllib.request.Request(url)
        req.add_header("Authorization", f"Basic {auth_b64}")
        req.add_header("Content-Type", "application/json")
        req.add_header("User-Agent", "Python-urllib/3.0")
        
        try:
            # Make the API request with timeout
            with urllib.request.urlopen(req, timeout=10) as response:
                if response.status == 200:
                    data = json.loads(response.read().decode('utf-8'))
                    subscriber_count = data.get("stats", {}).get("member_count", 0)
                    
                    return {
                        "statusCode": 200,
                        "headers": {
                            "Content-Type": "application/json",
                            "Access-Control-Allow-Origin": "*"
                        },
                        "body": json.dumps({
                            "subscriber_count": subscriber_count + 30,
                            "success": True
                        })
                    }
                else:
                    error_data = {}
                    try:
                        error_data = json.loads(response.read().decode('utf-8'))
                    except:
                        pass
                    
                    return {
                        "statusCode": response.status,
                        "headers": {
                            "Content-Type": "application/json",
                            "Access-Control-Allow-Origin": "*"
                        },
                        "body": json.dumps({
                            "error": "Mailchimp API error",
                            "message": error_data.get("detail", f"HTTP {response.status}"),
                            "success": False
                        })
                    }
                    
        except urllib.error.HTTPError as e:
            error_data = {}
            try:
                error_data = json.loads(e.read().decode('utf-8'))
            except:
                pass
            
            return {
                "statusCode": e.code,
                "headers": {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*"
                },
                "body": json.dumps({
                    "error": "Mailchimp API error",
                    "message": error_data.get("detail", f"HTTP {e.code}: {e.reason}"),
                    "success": False
                })
            }
            
        except urllib.error.URLError as e:
            return {
                "statusCode": 503,
                "headers": {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*"
                },
                "body": json.dumps({
                    "error": "Network error",
                    "message": str(e.reason),
                    "success": False
                })
            }
            
        except TimeoutError:
            return {
                "statusCode": 408,
                "headers": {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*"
                },
                "body": json.dumps({
                    "error": "Request timeout",
                    "message": "The request to Mailchimp API timed out",
                    "success": False
                })
            }
            
    except Exception as e:
        return {
            "statusCode": 500,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            },
            "body": json.dumps({
                "error": "Internal server error",
                "message": str(e),
                "success": False
            })
        }
