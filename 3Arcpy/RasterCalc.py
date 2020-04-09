import arcpy
from arcpy import env
from arcpy.sa import *

# Set environment settings
env.workspace = "H:/muhaowei/1TheGreatGeenWall/CostPath_Add"

# expression='"outcostdist1.tif" + "outcostdist2.tif" + "outcostdist3.tif" + "outcostdist4.tif" + "outcostdist5.tif" + "outcostdist6.tif" + "outcostdist7.tif" + "outcostdist8.tif" + "outcostdist9.tif" + "outcostdist10.tif" + "outcostdist11.tif" + "outcostdist12.tif" + "outcostdist13.tif" + "outcostdist14.tif" + "outcostdist15.tif" + "outcostdist16.tif" + "outcostdist17.tif" + "outcostdist18.tif" + "outcostdist19.tif" + "outcostdist20.tif" + "outcostdist21.tif" + "outcostdist22.tif" + "outcostdist23.tif" + "outcostdist24.tif" + "outcostdist25.tif" + "outcostdist26.tif" + "outcostdist27.tif" + "outcostdist28.tif" + "outcostdist29.tif" + "outcostdist30.tif" + "outcostdist31.tif" + "outcostdist32.tif" + "outcostdist33.tif" + "outcostdist34.tif" + "outcostdist35.tif" + "outcostdist36.tif" + "outcostdist37.tif" + "outcostdist38.tif" + "outcostdist39.tif" + "outcostdist40.tif" + "outcostdist41.tif" + "outcostdist42.tif" + "outcostdist43.tif" + "outcostdist44.tif" + "outcostdist45.tif" + "outcostdist46.tif" + "outcostdist47.tif" + "outcostdist48.tif" + "outcostdist49.tif" + "outcostdist50.tif"'
# output_raster = "H:/muhaowei/1TheGreatGeenWall/CostPath_Add/1to50.tif"

# outCostDistance = arcpy.gp.RasterCalculator_sa(expression, output_raster)

# rasters = arcpy.ListRasters()
# sum = None 
# for raster in rasters:
#     if sum == None:
#         sum = Raster(raster)
#     else:
#         sum = sum + Raster(raster)
# # myRaster = arcpy.NumPyArrayToRaster(sum,x_cell_size=100)
# sum.save("sum.tif")

rasters = arcpy.ListRasters()
sum = rasters[0] 
i = 1
for raster in rasters[1:]:
    i = i + 1
    print "outcostdist" + str(i)
    sum = sum + Raster(raster)
# myRaster = arcpy.NumPyArrayToRaster(sum,x_cell_size=100)
sum.save("sum.tif")