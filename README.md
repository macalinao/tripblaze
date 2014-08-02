Trip-Maker
=========
It’s a travel website for planning your itinerary. By answering a small survey it will also be able to recommend places based on your preferences as well as the top rated places on TripAdvisor.

Survey
--------
After taking the survey we use a list of commands from the Sabre Api to meet the needs of the user to find the cheapest and best flight according to the users needs

In the survey, the user sets the departuredate. If departuredate is present and has a value, use departuredate and returndate. Ignore lengthofstay, earliestdeparturedate, and latestdeparturedate.
We also use the origin, departuredate, and returndate parameter (provided from the survey). The origin parameter is required in all request formats.  (String)
We also have another parameter for the location, (Also a string) which is provided from the survey and used to find the best flight.

Provided from the Survey
-------------------------
3-letter IATA airport code of the origin airport
departuredatetime
originlocation
returndatetime

What we can find out from the information
-------------------------------------------
We use the Fareinfo and the LowestFare to find out trips that are at a low cost along with the LowestNonStopFare if the user wants. The airports are provided through a json file that the Sabre API generates.

API's We're Using
-------------------
* Sabre API: DestinationFinder API (supplemental API's: TravelFromLookUp)
  * Using sabre-dev-studio-node
* GoogleMaps API
* PointsOfInterest API (composed of Tripomatic API & Google GeoCoding API)
* Yelp API
