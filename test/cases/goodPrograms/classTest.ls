Limon Car
BEGIN JUICING
​
    plant(pulp name ,slices year)
        BEGIN JUICING
        pulp thisLemon.name = name
        slices thisLemon.year = year
        END JUICING
​
​
    When life gives you lemons try slices getYear()
        BEGIN JUICING
        you get lemonade and thisLemon.year
        END JUICING
​
END JUICING
​
Car myCar = seed Car("Ford",2014)
​
Limon Ferrari branches Car
BEGIN JUICING
        plant(slices year)
        BEGIN JUICING
        pulp thisLemon.name = "F8 Spider"
        slices thisLemon.year = year
        END JUICING
END JUICING