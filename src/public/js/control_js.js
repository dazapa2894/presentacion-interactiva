$(function () {

	// Initialize the Reveal.js library with the default config options
	// See more here https://github.com/hakimel/reveal.js#configuration

	Reveal.initialize({
		history: true, // Every slide will change the URL
		width: 1280,
		height: 720,
		// Display a presentation progress bar
		progress: true,
		// Enable keyboard shortcuts for navigation
		keyboard: true,
		// Enable the slide overview mode
		overview: true,
		// Enables touch navigation on devices with touch input
		touch: true,
		margin: 0,
		minScale: 1,
		maxScale: 1
	});

	// Connect to the socket

	var socket = io();

	// Variable initialization
	var form = $('form.login');
	var resetForm = $('#reset');
	// var secretTextBox = form.find('input[type=text]');
	var presentation = $('.reveal');
	
	var key = "Dilian",
	animationTimeout;


	var playing = false;

	// evito que salgan muchas notas repetidas al evitar que 'on access' se llame varias veces en un mismo cliente

	let my_unique_id = '';
	let id_owned = false;
	let sesion_actual = '';
	let sesion_creada = false;

	socket.on('active_session', function (data) {
		// capturo una session anterior o la nueva
		sesion_actual = data;
		console.log('active sesion socket...', sesion_actual);

		if (sesion_actual != '' && !sesion_creada) {
			form.hide();
			socket.emit('load', {
				user_id: "EL CONTROLADOR",
				key: key
			});
			alert('retomando sesión = "'+ sesion_actual +'"');
		}
		

	});


	resetForm.submit((e) => {
		e.preventDefault();

		socket.emit('reset', {});
	});

	// When the page is loaded it asks you for a key and sends it to the server

	form.submit((e) => {

		e.preventDefault();

		// Aviso al server sobre la coexion del controlador
		socket.emit('');

		
		//key = secretTextBox.val().trim();
		key = "Dilian";
		
		// If there is a key, send it to the server-side
		// through the socket.io channel with a 'load' event.
		
		if (key.length) {
			
			console.log("id de la session del server = ", sesion_actual);

			if (sesion_actual == '') {
				console.log("no existe una session");
				console.log("emitiendo INIT_session");
				// reinicio todos los campos para una session nueva
				socket.emit('reset', {});
				socket.emit('init_session', {
					client_name: $("#client_name").val()
				});
			}

			// para que no muestre el estado de "retomando sesion"
			sesion_creada = true;

			console.log('emitiendo log');
			socket.emit('load', {
				user_id: "EL CONTROLADOR",
				key: key
			});
		}

	});

	socket.on('reload', (data) => {
		//location.reload();
	});

	let access_granted = false;

	// The server will either grant or deny access, depending on the secret key
	socket.on('access', (data) => {

		// Se ha conectado un nuevo visitante
		console.log("llego esto: ", data);

		//si este cliente ya entro, entonces evito que se repitan todos los emit
		if (access_granted) {
			return;
		}
		// el cliente ya entro
		access_granted = true;

		if (!id_owned) {
			id_owned = true;
			// set my unique id
			socket.on('your_id', (data) => {
				my_unique_id = data;
				console.log('MY ID = ', my_unique_id);
			});
		}

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


			$("video").on("play", function (e) {
				thaId = $(this).attr('id');
				socket.emit('play', {
					command: "play",
					id: thaId,
					key: key
				});
			});
			$("video").on("pause", function (e) {
				thaId = $(this).attr('id');
				socket.emit('play', {
					command: "stop",
					id: thaId,
					key: key
				});
			});

			$("video").on("seeked", function (e) {
				thaId = $(this).attr('id');
				socket.emit('play', {
					command: "seek",
					id: thaId,
					time: Math.floor(e.target.currentTime),
					key: key
				});
			});

			$("video").on("webkitfullscreenchange mozfullscreenchange fullscreenchange", function (e) {
				thaId = $(this).attr('id');
				console.log("change fullscreen");
				socket.emit('play', {
					command: "fullscreen_change",
					id: thaId,
					key: key
				});
			});



			// in_fullscreen
			// out_fullscreen

			$("#votacion").click(function () {
				console.log("votacion clicked");
				$("#ideaHolder").addClass("voting");
				socket.emit('turnVotation', {
					isActive: true
				});
			});

			$("#votacion2").click(function () {
				$("#purposeHolder").addClass("voting");
				socket.emit('turnVotation2', {
					isActive: true
				});
			});

			
			$("#save_idea").click(function () {

				let all = {};
				let post_id = '';
				let post_text = '';
				let post_type = '';
				let post_votes = '';

				$("#ideaHolder .postit").each((index, elem) => {

					post_id = $(elem).attr("id");
					post_text = $(elem).find("p").html();
					post_type = 'idea';
					post_votes = $(elem).find("span").html();

					all[post_id] = {
						post_id: post_id,
						post_text: post_text,
						post_type: post_type,
						post_votes: post_votes
					}
				});

				socket.emit('save_notes', {
					posts: all,
				});
			});


			$("#save_purpose").click(function () {
				let all = {};
				let post_id = '';
				let post_text = '';
				let post_type = '';
				let post_votes = '';

				$("#purposeHolder .postit").each((index, elem) => {

					post_id = $(elem).attr("id");
					post_text = $(elem).find("p").html();
					post_type = 'proposito';
					post_votes = $(elem).find("span").html();

					all[post_id] = {
						post_id: post_id,
						post_text: post_text,
						post_type: post_type,
						post_votes: post_votes
					}
				});

				socket.emit('save_notes', {
					posts: all
				});

			});


			socket.on('navigate', function (data) {

				// Another device has changed its slide. Change it in this browser, too:

				window.location.hash = data.hash;

				// The "ignore" variable stops the hash change from
				// triggering our hashchange handler above and sending
				// us into a never-ending cycle.

				ignore = true;

				setInterval(function () {
					ignore = false;
				}, 100);

			});

			socket.on('refresh_ideas', function (data) {

				console.log(data);
				// vacio todos los placeholders
				$(".placeHolder").empty();

				Object.values(data).forEach(idea => {
					$(idea.holder).append('<div class="postit" id="' + idea.key + '"><p>' + idea.idea + '</p><span id="' + idea.key + '">' + idea.votes + '</span></div>');
				});

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

	});

});