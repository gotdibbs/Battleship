(function () {
	"use strict";
	
	function _loginClick(){
		navigator.id.getVerifiedEmail(function onSignedIn(assertion) {
			if (assertion) {
				$("input").val(assertion);
				$("form").submit();
			} else {
				location.reload();
			}
		});
	}
	
	function _domReady() {
		$("#browserid").click(_loginClick);
	}

	$(document).ready(_domReady);

}());