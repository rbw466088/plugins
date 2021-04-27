(function ($){
	$(document).ready(function(){
		$('.accordion').accordion({
			heightStyle: 'content',
			active: 'false',
			collapsible: 'true',
	}); 

	//for navmenu screen resolution 
	$('.menu-toggle').click(function(){
		var window_height = $(window).height();
		var navmenu_height = $('.navigation').height();
		//check whether the menu is larger than the screen or not
		if (navmenu_height > window_height){
			$('.nav-menu').css({'height': (window_height - 50), 'overflow-y': 'scroll'});
		}

	})
	


	});

})(jQuery);

