$(function () {

	// Initialize the Reveal.js library with the default config options
	// See more here https://github.com/hakimel/reveal.js#configuration

	Reveal.initialize({
		history: true, // Every slide will change the URL
		controls: false,
		width: 1280,
		height: 720,
		// Display a presentation progress bar
		progress: false,
		// Enable keyboard shortcuts for navigation
		keyboard: false,
		// Enable the slide overview mode
		overview: false,
		// Enables touch navigation on devices with touch input
		touch: false,
	});
	//Reveal.toggleOverview( false );

	// Connect to the socket
	var socket = io();

	// Variable initialization
	// let secretTextBox = form.find('input[type=text]');
	let presentation = $('.reveal');
	let key = "",
	text = "",
	animationTimeout;
	let user_name,
	idea_counter = 0,
	purpuse_counter = 0;
	
	let sesion_actual = '';
	
	socket.on('active_session', function (data) {
		console.log('active sesion socket...', data);
		sesion_actual = data;
	});

	// When the page is loaded it asks you for a key and sends it to the server
	let form = $('form.login');
	let form_submited = false;
	form.submit(function (e) {
		e.preventDefault();


		if(sesion_actual == ''){
			console.log('no existe ninguna sesion...', sesion_actual);
			alert("Aun no se ha creado la sesión, espera un momento...");
			return;
		}else{
			console.log('la session actual es: ', sesion_actual);
		}

		//key = secretTextBox.val().trim();
		key = "Dilian";
		user_name = $("#user_name").val();

		// If there is a key, send it to the server-side
		// through the socket.io channel with a 'load' event.

		if (key.length) {
			socket.emit('load', {
				key: key,
				user_id: user_name
			});
		}

		form_submited = true;
	});


	$("#creencia").submit(function (e) {
		e.preventDefault();
		text = $("#newIdea").val();

		if (text !== "") {
			$("#newIdea").val("");
			socket.emit('ideaRecieved', {
				idea: text,
				votes: 0,
				holder: "#ideaHolder",
				key: user_name + '-idea-' + idea_counter
			});
			idea_counter++;
		}

	});

	$("#proposito").submit(function (e) {
		e.preventDefault();
		text = $("#newPurpose").val();


		if (text !== "") {
			$("#newPurpose").val("");
			socket.emit('ideaRecieved', {
				idea: text,
				votes: 0,
				holder: "#purposeHolder",
				key: user_name + '-purpose-' + purpuse_counter
			});
			purpuse_counter++;

		}

	});

	let ideasVotationEnabled, purposeVotationEnabled = true;
	let idesNumVotes, purposeNumVotes = 0;


	$("#ideaHolder").on('click', '.postit', (e) => {
		console.log('postit clicked');
		obj = e.target;
		id = obj.id;
		vote_counter = parseInt($("#votes-" + id).html());
		console.log('obj = ', obj);
		console.log('id = ', id);
		console.log('votes = ', vote_counter);
		console.log('idesNumVotes = ', idesNumVotes);
		console.log('ideasVotationEnabled = ', ideasVotationEnabled);


		if (ideasVotationEnabled) {
			idesNumVotes++;
			if (idesNumVotes >= 5) {
				ideasVotationEnabled = false;
			}
			socket.emit('ideaVoted', {
				id: id,
				num_votes: vote_counter + 1
			});
		}
	});

	$("#purposeHolder").on('click', '.postit', (e) => {
		console.log('postit clicked');
		obj = e.target;
		id = obj.id;
		vote_counter = parseInt($("#votes-" + id).html());
		console.log('obj = ', obj);
		console.log('id = ', id);
		console.log('votes = ', vote_counter);
		console.log('purposeNumVotes = ', purposeNumVotes);
		console.log('purposeVotationEnabled = ', purposeVotationEnabled);


		if (purposeVotationEnabled) {
			purposeNumVotes++;
			if (purposeNumVotes >= 5) {
				purposeVotationEnabled = false;
			}
			socket.emit('ideaVoted', {
				id: id,
				num_votes: vote_counter + 1
			});
		}

	});
	// The server will either grant or deny access, depending on the secret key

	// evito que salgan muchas notas repetidas al evitar que 'on access' se llame varias veces en un mismo cliente
	let access_granted = false;
	let my_unique_id = '';


	socket.on('access', function (data) {

		if (!form_submited) {
			return;
		}

		//si este cliente ya entro, entonces evito que se repitan todos los emit
		if (access_granted) {
			return;
		}
		// el cliente ya entro
		access_granted = true;

		// set my unique id
		socket.on('your_id', (data) => {
			my_unique_id = data;
			console.log(my_unique_id);
		})

		// Check if we have "granted" access.
		// If we do, we can continue with the presentation.

		if (data === "granted") {

			// Unblur everything
			presentation.removeClass('blurred');

			form.hide();

			var ignore = false;

			$(window).on('hashchange', function () {

				// Notify other clients that we have navigated to a new slide
				// by sending the "slide-changed" message to socket.io

				if (ignore) {
					// You will learn more about "ignore" in a bit
					return;
				}

				var hash = window.location.hash;

				socket.emit('slide-changed', {
					hash: hash,
					key: key
				});
			});

			socket.on('navigate', function (data) {

				// Another device has changed its slide. Change it in this browser, too:
				console.log('navigationg to actual hash');
				window.location.hash = data.hash;

				// The "ignore" variable stops the hash change from
				// triggering our hashchange handler above and sending
				// us into a never-ending cycle.

				ignore = true;

				setInterval(function () {
					ignore = false;
				}, 100);

			});

			socket.on('enableVotation', (data) => {
				console.log(' enabled votacion 1', data);
				if (data) {
					$("#creencia").hide();
					$("#ideaHolder").addClass("voting");
				}
				idesNumVotes = 0;
				ideasVotationEnabled = data;
				console.log('ideasVotationEnabled = ', data);
			});

			socket.on('enableVotation2', (data) => {
				console.log(' enabled votacion 2', data);
				if (data) {
					$("#proposito").hide();
					$("#purposeHolder").addClass("voting");
				}
				purposeNumVotes = 0;
				purposeVotationEnabled = data;
				console.log('purposeVotationEnabled = ', data);
			});


			// cuando se recibe un postit
			socket.on('refresh_ideas', (data) => {

				console.log('refreshing ideas');
				console.log(data);
				// vacio todos los placeholders
				$(".placeHolder").empty();


				Object.values(data).forEach(idea => {
					$(idea.holder).append('<div class="postit" id="' + idea.key + '"><p>' + idea.idea + '</p><span id="votes-' + idea.key + '">' + idea.votes + '</span></div>');
				});
			});

			let fullscreen = false;
			socket.on('command', function (data) {

				switch (data.command) {
					case "play":
						$('#' + data.id).get(0).play();
						break;
					case "stop":
						$('#' + data.id).get(0).pause();
						break;
					case "seek":
						video = document.getElementById(data.id);
						//console.log( data.time );
						tiempo = Math.floor(data.time);
						video.currentTime = tiempo;
						break;
					case "fullscreen_change":
						video = document.getElementById(data.id);
						console.log("change fullscreen");

						if(fullscreen){
							console.log("OPEN fullscreen");
							openFullscreen(video);
						}else{
							console.log("CLOSE fullscreen");
							closeFullscreen(video);
						}
						fullscreen = !fullscreen;
						break;
			
				}

			});



		} else {

			// Wrong secret key

			clearTimeout(animationTimeout);

			// Addding the "animation" class triggers the CSS keyframe
			// animation that shakes the text input.

			secretTextBox.addClass('denied animation');

			animationTimeout = setTimeout(function () {
				secretTextBox.removeClass('animation');
			}, 1000);

			form.show();
		}

	}); // EMIT ACCESS


	function openFullscreen(elem) {
		if (elem.requestFullscreen) {
			elem.requestFullscreen();
		} else if (elem.mozRequestFullScreen) {
			/* Firefox */
			elem.mozRequestFullScreen();
		} else if (elem.webkitRequestFullscreen) {
			/* Chrome, Safari and Opera */
			elem.webkitRequestFullscreen();
		} else if (elem.msRequestFullscreen) {
			/* IE/Edge */
			elem.msRequestFullscreen();
		}
	}

	/* Close fullscreen */
	function closeFullscreen(elem) {
		if (document.exitFullscreen) {
			document.exitFullscreen();
		} else if (document.mozCancelFullScreen) {
			/* Firefox */
			document.mozCancelFullScreen();
		} else if (document.webkitExitFullscreen) {
			/* Chrome, Safari and Opera */
			document.webkitExitFullscreen();
		} else if (document.msExitFullscreen) {
			/* IE/Edge */
			document.msExitFullscreen();
		}
	}

});