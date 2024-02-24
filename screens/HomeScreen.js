import { View, Text, Image, TextInput, TouchableOpacity, ScrollView } from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "../theme";
import { CalendarDaysIcon, MagnifyingGlassIcon } from "react-native-heroicons/outline";
import { MapPinIcon } from "react-native-heroicons/solid";
import { debounce } from "lodash";
import { fetchLocations, fetchWeatherForecast } from "../api/weather";
import * as Progress from "react-native-progress";
import { getData, storeData } from "../utils/asyncStorate";

export default function HomeScreen() {
    const [showSearch, setShowSearch] = useState(false);
    const [locations, setLocations] = useState([]);
    const [weather, setWeather] = useState({});
    const [loading, setLoading] = useState(true);

    const handleLocation = (location) => {
        console.log(location);
        setLocations([]);
        setShowSearch(false);
        setLoading(true);
        fetchWeatherForecast({
            cityName: location.name,
            days: "7",
        }).then((data) => {
            setWeather(data);
            setLoading(false);
            storeData('city', location.name);
        });
    };

    const handleSearch = (value) => {
        if (value.length > 2) {
            fetchLocations({ cityName: value }).then((data) => {
                setLocations(data);
            });
        }
    };

    useEffect(() => {
        fetchMyWeatherData();
        setLoading(false);
    }, []);

    const fetchMyWeatherData = async () => {
        let myCity = await getData('city');
        let cityName = 'Ha Noi';
        if (myCity) cityName = myCity;
        const data = await fetchWeatherForecast({
            cityName,
            days: "7",
        }).then((data) => {
            setWeather(data);
        });
    };

    const handleTextDebounce = useCallback(debounce(handleSearch, 0), []);

    const { location, current } = weather;

    return (
        <View className="flex-1 relative">
            <StatusBar style="dark" />
            <Image blurRadius={70} source={require("../assets/images/bg.png")} className="w-full h-full absolute" />

            {loading ? (
                <View className="flex-1 flex-row justify-center items-center">
                    <Progress.CircleSnail thickness={10} size={150} color={'#0bb3b2'} />
                </View>
            ) : (
                <SafeAreaView className="flex flex-1">
                    <View style={{ height: "7%" }} className="mx-4 relative z-50">
                        <View
                            className="flex-row justify-end items-center rounded-full"
                            style={{ backgroundColor: showSearch ? theme.bgWhite(0.2) : "transparent" }}>
                            {showSearch ? (
                                <TextInput
                                    onChangeText={handleTextDebounce}
                                    placeholder="Search city"
                                    placeholderTextColor={"lightgray"}
                                    className="text-white pb-1 text-base pl-6 h-10 flex-1"
                                />
                            ) : null}

                            <TouchableOpacity
                                onPress={() => setShowSearch(!showSearch)}
                                style={{ backgroundColor: theme.bgWhite(0.3) }}
                                className="rounded-full m-1 p-3">
                                <MagnifyingGlassIcon size={25} color={"white"} />
                            </TouchableOpacity>
                        </View>

                        {locations.length > 0 && showSearch ? (
                            <View className="absolute w-full bg-gray-300 top-16 rounded-3xl">
                                {locations.map((location, index) => {
                                    let showBorder = index + 1 != locations.length;
                                    let borderClass = showBorder ? "border-b-2 border-b-gray-400" : "";
                                    return (
                                        <TouchableOpacity
                                            onPress={() => handleLocation(location)}
                                            key={index}
                                            className={"flex-row items-center border-0 p-3 px-4 mb-1 " + borderClass}>
                                            <MapPinIcon size={20} color={"gray"} />
                                            <Text className="text-black text-lg ml-2">
                                                {location?.name}, {location?.country}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        ) : null}
                    </View>

                    {/* forecast */}
                    <View className="mx-4 flex-1 justify-around mb-2">
                        <Text className="text-white text-center text-2xl font-bold">
                            {location?.name},
                            <Text className="text-gray-300 text-lg font-semibold"> {location?.country}</Text>
                        </Text>

                        <View className="flex-row justify-center">
                            <Image source={{ uri: "https:" + current?.condition?.icon }} className="w-52 h-52" />
                            {/* <Image source={require("../assets/images/partlycloudy.png")} className="w-52 h-52" /> */}
                        </View>

                        <View className="space-y-2">
                            <Text className="text-white font-bold text-center text-6xl ml-5 ">
                                {current?.temp_c}&#176;
                            </Text>
                            <Text className="text-white text-center text-xl tracking-widest">
                                {current?.condition?.text}
                            </Text>
                        </View>

                        <View className="flex-row mx-4 justify-between">
                            <View className="flex-row space-x-2 items-center">
                                <Image source={require("../assets/icons/wind.png")} className="w-6 h-6" />
                                <Text className="text-white font-semibold text-base">{current?.wind_kph}km</Text>
                            </View>
                            <View className="flex-row space-x-2 items-center">
                                <Image source={require("../assets/icons/drop.png")} className="w-6 h-6" />
                                <Text className="text-white font-semibold text-base">{current?.humidity}%</Text>
                            </View>
                            <View className="flex-row space-x-2 items-center">
                                <Image source={require("../assets/icons/sun.png")} className="w-6 h-6" />
                                <Text className="text-white font-semibold text-base">{weather?.forecast?.forecastday[0]?.astro?.sunrise}</Text>
                            </View>
                        </View>
                    </View>

                    {/* forecast for next days */}
                    <View className="mb-2 space-y-3">
                        <View className="mx-5 flex-row space-x-3 items-center">
                            <CalendarDaysIcon size={22} color={"white"} />
                            <Text className="text-white text-base">Daily forecast</Text>
                        </View>

                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ paddingHorizontal: 15 }}>
                            {weather?.forecast?.forecastday?.map((item, index) => {
                                let date = new Date(item.date);
                                let options = { weekday: "long" };
                                let dayName = date.toLocaleDateString("en-US", options);
                                dayName = dayName.split(",")[0];
                                return (
                                    <View
                                        key={index}
                                        className="flex justify-center items-center w-24 rounded-3xl py-3 space-y-1 mr-4"
                                        style={{ backgroundColor: theme.bgWhite(0.15) }}>
                                        <Image
                                            source={{ uri: "https:" + item?.day?.condition?.icon }}
                                            className="w-11 h-11"
                                        />
                                        <Text className="text-white">{dayName}</Text>
                                        <Text className="text-white font-semibold text-xl">
                                            {item?.day?.avgtemp_c}&#176;
                                        </Text>
                                    </View>
                                );
                            })}
                        </ScrollView>
                    </View>
                </SafeAreaView>
            )}
        </View>
    );
}
