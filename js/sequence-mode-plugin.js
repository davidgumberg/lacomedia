/*
BSD 3-Clause License

Copyright (c) 2020, Pelagios | Recogito
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this
   list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright notice,
   this list of conditions and the following disclaimer in the documentation
   and/or other materials provided with the distribution.

3. Neither the name of the copyright holder nor the names of its
   contributors may be used to endorse or promote products derived from
   this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

const SequenceModePlugin = (anno, viewer, opts={}) => {

  const {pagedAnnotations} = opts;

  const currentPage = () => {
    return(`${viewer.image.book}-${viewer.image.canto}`)
  }

  // set initial annotation
  anno.setAnnotations(Object.values(pagedAnnotations[currentPage()] || {}));

  const addOrUpdateAnnotationPages = (annotation) => {
    if(!pagedAnnotations[currentPage()]) {
      pagedAnnotations[currentPage()] = {};
    }
    
    pagedAnnotations[currentPage()][annotation.id] = annotation;
  };

  const removePagedAnnotation = (annotation) => {
    delete pagedAnnotations[currentPage()]?.[annotation.id]; 
  };
    
  anno.on('createAnnotation', addOrUpdateAnnotationPages);
  anno.on('updateAnnotation', addOrUpdateAnnotationPages);
  anno.on('deleteAnnotation', removePagedAnnotation);

  viewer.osd.addHandler('open', () => {
    // const tileSourceURL = viewer.osd.world.getItemAt(0).source.url;
    anno.setAnnotations(Object.values(pagedAnnotations[currentPage()] || {}));
  });


  viewer.osd.addHandler('page', () => {
      anno.cancelSelected();
      anno.clearAnnotations();
  });

  anno.getAllAnnotations = () => {
    return pagedAnnotations
  };
};

export default SequenceModePlugin;
