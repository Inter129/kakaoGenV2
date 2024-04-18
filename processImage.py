from PIL import Image
import numpy as np

image = Image.open('p2.jpg')
img_rgb = image.convert('RGB')
img_array = np.array(img_rgb)

import math
def rgb2brightness(R, G, B):
    return math.sqrt( 0.299*(R**2) + 0.587*(G**2) + 0.114*(B**2) )

enablesMap = []

for i in range(len(img_array)):
    enb = []
    for j in range(len(img_array[i])):
        # get 5x5 pixels around the pixel

        rgb = img_array[i][j]
        brightness = rgb2brightness(rgb[0], rgb[1], rgb[2])
        enb.append(brightness > 235)
    enablesMap.append(enb)

for i in range(len(img_array)):
    for j in range(len(img_array[i])):
        # get around 3x3 pixels around the pixel
        enables = 0
        for k in range(-1, 2):
            for l in range(-1, 2):
                if i+k >= 0 and i+k < len(img_array) and j+l >= 0 and j+l < len(img_array[i]):
                    enables += enablesMap[i+k][j+l]
        if enables > 4:
            img_array[i][j] = [255, 255, 255]
        else:
            img_array[i][j] = [0, 0, 0]


img = Image.fromarray(img_array, 'RGB')
img.show()