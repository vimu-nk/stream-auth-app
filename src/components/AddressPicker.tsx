"use client";

import { useState, useEffect, useRef } from "react";
import { GoogleMap, useJsApiLoader } from "@react-google-maps/api";

const libraries: ("places" | "marker")[] = ["places", "marker"];

interface AddressPickerProps {
	onAddressSelect: (address: string) => void;
}

export default function AddressPicker({ onAddressSelect }: AddressPickerProps) {
	const { isLoaded } = useJsApiLoader({
		googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
		libraries,
	});

	const [center] = useState({ lat: 7.8731, lng: 80.7718 });
	const [markerPosition, setMarkerPosition] = useState(center);
	const mapRef = useRef<google.maps.Map | null>(null);
	const markerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(
		null
	); // Refers to AdvancedMarkerElement

	useEffect(() => {
		if (!isLoaded || !mapRef.current) return;

		// If marker already exists, remove it
		if (markerRef.current) {
			markerRef.current.map = null;
		}

		// Create a new AdvancedMarkerElement
		markerRef.current = new window.google.maps.marker.AdvancedMarkerElement(
			{
				map: mapRef.current,
				position: markerPosition,
			}
		);
	}, [isLoaded, markerPosition]);

	const handleClick = async (e: google.maps.MapMouseEvent) => {
		if (!e.latLng) return;
		const lat = e.latLng.lat();
		const lng = e.latLng.lng();
		setMarkerPosition({ lat, lng });

		try {
			const res = await fetch(
				`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
			);
			const data = await res.json();

			const address = data.results?.[0]?.formatted_address || "";

			onAddressSelect(address);
		} catch {
			// Handle error silently or with a user-friendly message
		}
	};

	if (!isLoaded) return <div>Loading Map...</div>;

	return (
		<GoogleMap
			mapContainerStyle={{ width: "100%", height: "300px" }}
			center={center}
			zoom={8}
			onLoad={(map) => {
				mapRef.current = map;
			}}
			onClick={handleClick}
			options={{ mapId: "DEMO_MAP_ID" }}
		>
			{/* No need to manually render AdvancedMarkerElement here */}
		</GoogleMap>
	);
}
