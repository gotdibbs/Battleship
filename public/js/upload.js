(function () {
	"use strict";

	$(document).ready(function _domReady() {
		$("#upload").change(function () { 
			$("#aiPicker").val($(this).val()); 
		});
		$("#pickAIButton").click(function () { 
			$("#upload").click(); 
		});
		
		$.validator.setDefaults({
			errorPlacement: function(error, element) {
				if (element.is("#aiPicker")) {
					error.insertAfter(element.next()).css("margin-top", "10px");
				}
				else {
					error.insertAfter(element);
				}
			}
		});
		
		$(".form").validate();
		
		$('.form').bind('change keyup', function() {
			if($(this).validate().checkForm()) {
				$('.form input[type="submit"]').attr('disabled', false);
			} else {
				$('.form input[type="submit"]').attr('disabled', true);
			}
		});
	});

}());