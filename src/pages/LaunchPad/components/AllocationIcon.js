import React from "react";
import { useEffect } from "react";
import lottie from "lottie-web";

const AllocationIcon = ({ play, url, id }) => {
	useEffect(() => {
		lottie.destroy(id);

		lottie.loadAnimation({
			container: document.querySelector(`#${id}`),
			animationData: url,
			autoplay: play,
			loop: true,
			name: id,
		});
	}, [play]);

	return (
		<div className="">
			<div id={id} />
		</div>
	);
};

export default AllocationIcon;