"use client";

import { useState, useEffect } from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";

interface AddressPickerProps {
	onAddressSelect: (address: string) => void;
}

export default function AddressPicker({ onAddressSelect }: AddressPickerProps) {
	const { isLoaded } = useJsApiLoader({
		googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
		libraries: ["places"],
	});

	const [center, setCenter] = useState({ lat: 6.8972, lng: 79.8598 }); // Thummulla Junction
	const [marker, setMarker] = useState(center);

	useEffect(() => {
		if (!isLoaded) return;
	}, [isLoaded]);

	const handleClick = async (e: google.maps.MapMouseEvent) => {
		if (!e.latLng) return;
		const lat = e.latLng.lat();
		const lng = e.latLng.lng();
		setMarker({ lat, lng });

		const res = await fetch(
			`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
		);
		const data = await res.json();
		const address = data.results[0]?.formatted_address || "";
		onAddressSelect(address);
	};

	if (!isLoaded) return <div>Loading Map...</div>;

	return (
		<GoogleMap
			mapContainerStyle={{ width: "100%", height: "300px" }}
			center={center}
			zoom={8}
			onClick={handleClick}
		>
			<Marker position={marker} />
		</GoogleMap>
	);
}
