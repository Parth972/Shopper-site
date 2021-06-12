let postEditForm=document.getElementById('postEditForm');
	postEditForm.addEventListener('submit', function(event){
		//find length of uploaded images
		let imageUploads=document.getElementById('imageUpload').files.length;

		//find length of existing images
		let existingImgs=document.querySelectorAll('.imageDeleteCheckbox').length;

		//find length of selected images to be deleted
		let imgDeletions=document.querySelectorAll('input[name=deleteImages]:checked').length;

		let newTotal=existingImgs-imgDeletions+imageUploads;
		if(newTotal>4)
		{
			event.preventDefault();
			let removeAnt=newTotal-4;
			alert(`You need to remove at least ${removeAnt} more image${ removeAnt===1 ? '' : 's' } `);
			
		}
	});	