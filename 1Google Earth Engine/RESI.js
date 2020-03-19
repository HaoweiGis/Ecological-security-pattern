var lanzhou = ee.FeatureCollection("users/blackmhw/Earth_BigData/lanzhou"),
    wuhan = ee.FeatureCollection("users/blackmhw/Earth_BigData/wuhan"),
    guangzhou = ee.FeatureCollection("users/blackmhw/Earth_BigData/guangzhou"),
    shanghai = ee.FeatureCollection("users/blackmhw/shanghai"),
    tianjin = ee.FeatureCollection("users/blackmhw/Earth_BigData/tianjin");

    
Map.addLayer(tianjin)
Map.centerObject(tianjin)

//////////////////////////////////去云
var getQABits = function(image, start, end, newName) {
    // Compute the bits we need to extract.
    var pattern = 0;
    for (var i = start; i <= end; i++) {
      pattern += Math.pow(2, i);
    }
    // Return a single band image of the extracted QA bits, giving the band
    // a new name.
    return image.select([0], [newName])
                  .bitwiseAnd(pattern)
                  .rightShift(start);
};

// A function to mask out cloudy pixels.
var cloud_shadows = function(image) {
  // Select the QA band.
  var QA = image.select(['pixel_qa']);
  // Get the internal_cloud_algorithm_flag bit.
  return getQABits(QA, 3,3, 'Cloud_shadows').eq(0);
  // Return an image masking out cloudy areas.
};

// A function to mask out cloudy pixels.
var clouds = function(image) {
  // Select the QA band.
  var QA = image.select(['pixel_qa']);
  // Get the internal_cloud_algorithm_flag bit.
  return getQABits(QA, 5,5, 'Cloud').eq(0);
  // Return an image masking out cloudy areas.
};

var maskClouds = function(image) {
  var cs = cloud_shadows(image);
  var c = clouds(image);
  image = image.updateMask(cs);
  return image.updateMask(c);
};

// PCA
var getPrincipalComponents = function(centered, scale, region) {
  // Collapse the bands of the image into a 1D array per pixel.
  var arrays = centered.toArray();

  // Compute the covariance of the bands within the region.
  var covar = arrays.reduceRegion({
    reducer: ee.Reducer.centeredCovariance(),
    geometry: region,
    scale: scale,
    maxPixels: 1e13
  });

  // Get the 'array' covariance result and cast to an array.
  // This represents the band-to-band covariance within the region.
  var covarArray = ee.Array(covar.get('array'));

  // Perform an eigen analysis and slice apart the values and vectors.
  var eigens = covarArray.eigen();

  // This is a P-length vector of Eigenvalues.
  var eigenValues = eigens.slice(1, 0, 1);
  // This is a PxP matrix with eigenvectors in rows.
  var eigenVectors = eigens.slice(1, 1);

  // Convert the array image to 2D arrays for matrix computations.
  var arrayImage = arrays.toArray(1);

  // Left multiply the image array by the matrix of eigenvectors.
  var principalComponents = ee.Image(eigenVectors).matrixMultiply(arrayImage);

  // Turn the square roots of the Eigenvalues into a P-band image.
  var sdImage = ee.Image(eigenValues.sqrt())
      .arrayProject([0]).arrayFlatten([getNewBandNames('sd')]);

  // Turn the PCs into a P-band image, normalized by SD.
  return principalComponents
      // Throw out an an unneeded dimension, [[]] -> [].
      .arrayProject([0])
      // Make the one band array image a multi-band image, [] -> image.
      .arrayFlatten([getNewBandNames('pc')])
      // Normalize the PCs by their SDs.
      .divide(sdImage);
};

var visParamsRGB = {
  bands: ['B4', 'B3', 'B2'],
  min: 281,
  max: 4493,
  gamma: 1,
};

////////////////////////////////主代码
var landsat8 = ee.ImageCollection('LANDSAT/LC08/C01/T1_SR')

// // 单独一景无云影像
var imgs1 = landsat8.filterDate('2019-06-01','2019-10-01').filterBounds(tianjin).filter(ee.Filter.lt('CLOUD_COVER',10))
var imgs2 = landsat8.filterDate('2018-06-01','2018-10-01').filterBounds(tianjin).filter(ee.Filter.lt('CLOUD_COVER',10))
print(imgs1.merge(imgs2))
var ThreeNorthImg = ee.Image('LANDSAT/LC08/C01/T1_SR/LC08_122033_20190927').clip(tianjin)
Map.addLayer(ThreeNorthImg,visParamsRGB)

// // // 多景合成影像
// var imgs1 = landsat8.filterDate('2019-03-01','2019-11-01').filterBounds(tianjin)
// var imgs2 = landsat8.filterDate('2018-06-01','2018-10-01').filterBounds(tianjin)
// // var ThreeNorthImgs = imgs1.merge(imgs2)
// print(imgs1)
// var ThreeNorthImg = imgs1.map(maskClouds).median().clip(tianjin)
// print(ThreeNorthImg)
// Map.addLayer(ThreeNorthImg,visParamsRGB)

///////////////////////////////////////////////////////指数计算代码
// //////////////////NDVI:
{
var ndvi = ThreeNorthImg.normalizedDifference(['B5', 'B4']).rename('NDVI');
// print(ndvi)
// var ndvi10000 = ndvi.multiply(10000).to
var ndviParams = {min: -1, max: 1, palette: ['blue', 'white', 'green']};
// print(ndvi,'ndvi');
// Map.addLayer(ndvi, ndviParams, 'ndvi');
}

//select thermal band 10(with brightness tempereature), no BT calculation 
var thermal= ThreeNorthImg.select('B10').multiply(0.1);

var b10Params = {min: 2878000, max: 3046000, palette: ['blue', 'white', 'green']};
// Map.addLayer(thermal, b10Params, 'thermal');

// find the min and max of NDVI
{
var min = ee.Number(ndvi.reduceRegion({
  reducer: ee.Reducer.min(),
  geometry: tianjin,
  scale: 100,
  maxPixels: 1e13
  }).values().get(0));
// print(min, 'min');
var max = ee.Number(ndvi.reduceRegion({
    reducer: ee.Reducer.max(),
  geometry: tianjin,
  scale: 100,
  maxPixels: 1e13
  }).values().get(0));
// print(max, 'max')
}

//fractional vegetation
{
var fv = ndvi.subtract(min).divide(max.subtract(min)).rename('FV'); 
// print(fv, 'fv');
//Map.addLayer(fv);
}

//////////// //Emissivity
  var a= ee.Number(0.004);
  var b= ee.Number(0.986);
  var EM=fv.multiply(a).add(b).rename('EMM');
  var imageVisParam2 = {min: 0.98, max: 0.99, palette: ['blue', 'white', 'green']};
  // Map.addLayer(EM, imageVisParam2,'EMM');

var LST = thermal.expression(
    '(Tb/(1 + (0.001145* (Tb / 1.438))*log(Ep)))-273.15', {
      'Tb': thermal.select('B10'),
      'Ep': EM.select('EMM')
}).rename('LST');
// print(LST)
// Map.addLayer(LST,'LST')

// //////////////////Wet
var Wetness = ThreeNorthImg.expression(
  '0.1511*blue+ 0.1973*green + 0.3283*red + 0.3407*Rnir - 0.7117*Rmir1 - 0.4559*Rmir2',
  {
    blue:ThreeNorthImg.select('B2'),
    green:ThreeNorthImg.select('B3'),
    red:ThreeNorthImg.select('B4'),
    Rnir:ThreeNorthImg.select('B5'),
    Rmir1:ThreeNorthImg.select('B6'),
    Rmir2:ThreeNorthImg.select('B7'),
  }
  ).rename('WET')
// print(Wetness)

// //////////////////NDSI
var SI = ThreeNorthImg.expression(
  '((Rmir1+red)-(Rnir+blue))/((Rmir1+red)+(Rnir+blue))',
  {
    blue:ThreeNorthImg.select('B2'),
    red:ThreeNorthImg.select('B4'),
    Rnir:ThreeNorthImg.select('B5'),
    Rmir1:ThreeNorthImg.select('B6'),
  }
  )

var IBI = ThreeNorthImg.expression(
  '(2*Rmir1/(Rmir1+Rnir)-(Rnir/(Rnir+red)+green/(green+Rmir1)))/(2*Rmir1/(Rmir1+Rnir)+(Rnir/(Rnir+red)+green/(green+Rmir1)))',
  {
    blue:ThreeNorthImg.select('B2'),
    green:ThreeNorthImg.select('B3'),
    red:ThreeNorthImg.select('B4'),
    Rnir:ThreeNorthImg.select('B5'),
    Rmir1:ThreeNorthImg.select('B6'),
  }
  )
var NDSI = SI.add(IBI).divide(2).rename('NDSI')

var RESIImg = ndvi.addBands(LST).addBands(Wetness).addBands(NDSI).toFloat()
// tianjin(RESIImg)
// Map.addLayer(RESIImg)

// //////////////////归一化
var minMax = RESIImg.reduceRegion({
  reducer: ee.Reducer.minMax(),
  geometry: tianjin,
  scale: 30,
  maxPixels: 10e13,
  // tileScale: 16
});
// use unit scale to normalize the pixel values
var RESIImgNor = ee.ImageCollection.fromImages(
  RESIImg.bandNames().map(function(name){
    name = ee.String(name);
    var band = RESIImg.select(name);
    return band.unitScale(ee.Number(minMax.get(name.cat('_min'))), ee.Number(minMax.get(name.cat('_max'))))
                // eventually multiply by 100 to get range 0-100
                //.multiply(100);
})).toBands().rename(RESIImg.bandNames());
print(RESIImgNor)
Map.addLayer(RESIImgNor)

// //////////////////PCI
var scale = 30;
var region = RESIImgNor.geometry();
var bandNames = RESIImgNor.bandNames();
var meanDict = RESIImgNor.reduceRegion({
    reducer: ee.Reducer.mean(),
    geometry: region,
    scale: scale,
    maxPixels: 1e13
});
var means = ee.Image.constant(meanDict.values(bandNames));
var centered = RESIImgNor.subtract(means);

var getNewBandNames = function(prefix) {
  var seq = ee.List.sequence(1, bandNames.length());
  return seq.map(function(b) {
    return ee.String(prefix).cat(ee.Number(b).int());
  });
};
var pcImage = getPrincipalComponents(centered, scale, region);
var RSEI = pcImage.select(['pc1']);
print(RSEI)
Map.addLayer(RSEI)

var RSEIIndexs = RESIImg.addBands(RSEI).toFloat()
// print(RSEIIndexs)
Export.image.toDrive({
  image: RSEIIndexs,
  description: 'tianjinRSEIs',
  scale: 30,
  region: tianjin,
  maxPixels:1e13,
  crs: 'EPSG:4326'
});

// Export.image.toAsset({
//   image: RESIImg,
//   description: 'RSEIImg3',
//   assetId: 'RSEIImg3',
//   scale: 100,
//   region: tianjin,
//   maxPixels:1e13,
// });


// //////////////////数据量太大时的导出方法
// var ExportImage = function(RESIImg,id,name){
//   var tianjinS = tianjin.filter(ee.Filter.eq('Id',id)).geometry()
//   // var tianjinS = geometry
// Export.image.toDrive({
//   image: RESIImg.clip(tianjinS),
//   description: name,
//   scale: 30,
//   region: tianjinS,
//   maxPixels:1e13,
//   crs: 'EPSG:4326'
// });
// }
// ExportImage(RESIImg,1,'H1RESIImage1')
// ExportImage(RESIImg,2,'H1RESIImage2')
// ExportImage(RESIImg,3,'H1RESIImage3')
// ExportImage(RESIImg,4,'H1RESIImage4')
// ExportImage(RESIImg,5,'H1RESIImage5')
// ExportImage(RESIImg,6,'H1RESIImage6')



