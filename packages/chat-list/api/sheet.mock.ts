import { IUserOrderState } from 'chat-list/types/license';
import { ISheetService, DataValidationColConfig, ITableOption, } from 'chat-list/types/api/sheet';
import { setLocalStore, getLocalStore } from 'chat-list/local/local'

class SheetServiceMock implements ISheetService {
  appendRows = async (value: string[][]) => {
    return;
  };
  highlightRowsWithColor = (rows: number[], color: string): Promise<void> => {
    return;
  };
  clearHighlightRows = (): Promise<void> => {
    return;
  };
  showModalDialog: (file: string, title: string, width?: number, height?: number) => Promise<void>;
  insertTable: (value: string[][], options: ITableOption) => Promise<void>;
  sleep() {
    return new Promise((resolve) => {
      setTimeout(resolve, 2000);
    });
  }
  initSheet: (name: string, titles: string[], options?: ITableOption) => Promise<void> = () => void 0;
  formatTable: (options?: ITableOption) => Promise<void> = () => void 0;
  AddChart: (type: string, title: string, xAxisTitle: string, yAxisTitle: string, yAxisTitles: string[]) => Promise<string> = async () => {
    return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAlgAAAFzCAYAAADi5Xe0AABB3klEQVR4Xu3d958V5d3/8e/fQXykSPGOCZp+a6JIImpiiSYaNYkRY6yxoUlULICFIiAoKAiCqFQrIkUUBQQR6R2X3nvz/guu776vOOvsZ+acOXN29pyZ3dcPz8fumeua2evMTvnM1eb/nfy//3MAAADIzv+zCwAAANAyBFgAAAAZI8ACAADIGAEWAABAxgiwAAAAMkaABQAAkDECLAAAgIwRYAEAAGSMAAsAACBjBFgAAAAZI8ACAADIGAEWAABAxgiwAAAAMkaABQAAkDECLAAAgIwRYAEAAGSMAAsAACBjBFgAAAAZI8ACAADIGAEWAABAxgiwAAAAMkaABQAAkDECLAAAgIwVOsB66qmnPLsc32AfoZ44/orrjTff9P+7qdOmRdKKQmXXd9B3sWlAa2u1AGvl6tVu4qRJ7tlhw1z//v3dgIED3bDhw92ECRPc7Dlz3KYvv4ysk1bRLt5btm9377z7rhsxcqQb2Lg/RL+/O32627pjRyR/FvK2j+qxD+opb/u/1qr5/sE6gaefftoNGjTIjRo92s1qvHbsP3Qosg6ytWTpUr/vx778sjt24kSztEr+p+XyVHNvsMeErhta59XXXnPzFyxwBw4fjqwjKru+g9b5/IsvIulAa8o8wDraeEC/PnFi5ISIY9dNK6vttLYTX33lZs6eHfn+lm4eymvXb4m87KN67oPWlLR/S6WXWt7WVPM97TFh6ca6a+/eyHrIxsEjR3xAq8Bn5549kfRK/qdxeVpyb7Dplsq7ojFws+uJvoO+yzPPPOO/m00HWkvmAdb7M2f6A/7555/3Twz7Dhxwx0+d8ifX7n373Nr1690Hc+e6kSNHRtZNq9TJmDdzP/zQl1NP4u/NmOEatm3z+0P0u5YpTXmU167fEnnZR/XcB62p2v1b7XpFU833tOso4FYNxao1a3wtltImTZ4cWQ/ZUC2S9rGu5TZN7P8nTlyeltwb7PaOnTzp11m2YoUbN368T9P1Y8WqVZF1w39b27dpQGvJPMAaOnSoP5B37t4dScuaPenySE/aQeCgqnGbHli+cmXTRUIXDpterTzso3rvg9ZU7f6tdr2iqeZ7lltn244dPk21ETYNLXfk+HFfG6R9XOocLPf/KZenJfeGuO2Fzf3oI58+ZMiQ2CZkfZfguFFAZ9OB1pB5gKWqWB3I+w8ejKQlmTJlinvhxRf9SaKb7ODBg90rEyaUvCmXO+nWb9rk2/m1LbXzP/fcc27G++/HVhHryem1119vyqsmCJWl1NNQGmryUhnfevvtSJoVdCrVE2R4efA99SS/5PPP3UsvveQGDBjgL4RBHj0JzvvkE/90qP/ByBdeaKo1ymIfVVKGUrLcBzZ/ubRqjyddgD+cN8/3DdN31D5dsHBhyfxxbJ4062nf6ve4cuqYVNqYMWMiaaW09n6Qao6/Usqtoz41StN3sGlS6TE9+uuaMNWK2W2sWbfOpymPTat0+1LNfiz33culpSlXOTom/PE1dmwkLVCuHOXytOTeELc9S9dw5VGfLJsm+k5KX712bSQNaA2ZB1ivvPKKP4h1sqsK2KaXE5xEcdTpslR+u/zj+fMj6wd0kTt87FhTXgULNk+Y3XZauhFqO7oA2jRr3caNPq+9uAVlefXVV0uWb8rUqZG0uHyBNPuo0jKUkuU+sPnLpdlyhpU7nhQc2Pyi5oi4/HFsnjTrfbp4sf99cmNgZMuoZUpbvGRJJK0U+zfCstgPkvb4K6fcOupno7QJjcehTUtzTCvA0fI333orsp23333Xpy349NOqty9BWpr9GKTZ5eXS0parHA020XqlghQpVY6kPFncG+zyMAVOyvPyuHGRNPnk6/2k7gg2DWgNmQdY6k8TVDHLqFGjfM2FDm49GZYa7WHpiVhNS8HFTk/gNk/cSbdx82a/bPjw4b7JSX9PT70ql57alTbngw+a8iufln3WGGjpaS/4u5813sDS1BKUoidKbb+SJ0nlUV6tE14efE89tS9ctMgdMFXgwVOnRtaob8Oho0f9toLajpbuo0rKUE6W+8DmT0oLpDmetF+WLlvmb0y6EQTBg0YjlVrHLk9KL7Vc9Hf1tK/ajvDN0S//utZQTTl2vUq0xn5Ie/wlsevo2Nyzf78PeHT8qRZuc0NDs3XSHtNKV02PmozUnydYrhpaNWUpLXytSrv98PeodD+G17HLS6VVU65ygloeu3/D4sphxeVpyb0hbnuWasaURy0QNk00OlHp9uENaC2ZB1gSXMB1MQxOjIAujhqOW+4EDtPFWuvpgmfT4k664AlfJ7PNv7fx4qa08E0lOOHjRstkQeXW9nVjs2mW8sR91+B7lroABSNz4p46s9hH4e2UKkM5We4Dmz8pzarkeLLBi45nLbdBX3gduzwpvdTygGpWlK4a1mBZUNuqaS5s/rSy3A9pj78kwTpxFPzoZmzXqeaYVkd5LQ83GamWVcts7WE12w/KXOl+DK9jl5dKq6Zc5ahpUeuUO8/jymGVylPtvaHU9sIUKCuPHkJsmqhvltLVRGvTgNbQKgFWQE+DO3bt8tX6H338sb8YBLUZOpnshVJPeGoe0ROe+qHoqUxPxaVOrrjlQ599NnLiWqodCPIHFyhduN+fNcs/jVfTR6CU4EKiG5pNs6qpvZGg82hcp9S4ddPuo1LbqVQ1+8B2Yi7390ulZXE8SdDvJy6t1PKk9FLLA0HNhG44wbKgeTbuZlpOa++HtMdfkmAdS81dpTooV3NMBzVv4WZCNR9pme2bVc32g+W2rKX2Y7l1SqVVU65yguMiXKtnxZXDSsqT9t6QtD1RrbrylKrBCgIwfUebBrSGVg2w4qiGQp0vdaDrYh8s37ZzZ+LFwm4rbnlQW5IkyK+bvjpW2/XUYTJtP4E4QYflSvofBU/PtgrbltkKRujFXRTj1rXftZSk7VSqqn1gmmfL/f24tKyOp6S0UsuT0kstD1PfHf1vdRwq6Nfv4XOmErXYD2mPvyR2HQWIQT8mdaS3+aWaY1rXIgWH4WZC3Zyfbdxftra1mu3HLUtKK7W8VFo15SqnkgAr6KxuJyANBAFk2kCm1L1BKvkeGqykPOrrZdOEAAu1VvMAS3TBtAf6+K87QGpOE/Ul2N54Y9ATSXBSxJ1cccuDp6BKakvCVKZgHpagmlxBls2XlmrFtK1KRtAFzUJpRtBJ0MwZNzw5bt1q9lHcdiqV5T6Iu/DHlS2r4ykprdTypPRSy8OCTrlqelP/I/2+6LPPIvnKqcV+SHv8JYlbZ9eePT4Q0nJbuyTVHNMS3NDVTKimKf2u49Xmq2b7cd8jKS1YXulxXk25yqmkiVBNbMpT6s0LeluD0keMGBFJSxJ3b5C4724FTb6qrbVpou+kdJoIUSuZB1i6kCfNc6IT05+AoQnlgienuAtFqZMrbnkwVFfVzjZ/pYK+C/Ykr4b6dgVP+OWmfQg6BCuvnaU67nuGlRvWH7duNfsobjuVSrsP9FRum5uCZkbbV079W+LKltXxlJQWfK9SI7WqXU8UsGhf6P+rDtH6TrY/T5Ja7Ie0x1+SUuuo2Uj7TQGdAsVwWjXHtATXIgX/wYOA5tqy+arZfqnvUS4t7XFeTbnKqaSTe/B+v+nvvRdJEy1X+rQ33mi2vNp7g8R997DgYUSv34k71iUIoG0LAdBaMg+wdADrIqinCY2cUbCgKmNdIHRyaXi0TgLlCz9p6GlHyzRCTXl1kqgfik7SUidX3PKgmlj0dKoTVttTGdTmr78Zbn7SzNAa8q4buqqo9Xc1olDr2ycd1W5pedzon3KC9bRf7CzmetprNov5Rx9F1o/7nnHb1wzI2ra+q0bMBDMc23XT7qNKypAkzT6IawYK3iemfkT6H6m8Xyxf3jQK1JYtq+MpKU1NSsF+jAt+ql0voDmsgm28M316JD1JLfZD2uMvSbl1FEgoTd8rPCq1mmM6oPmuVDum2ptSearZfrnvUSot7XFeTbnKqWSahqAZX/S/1whPXTv1Mzz3me0SoGXV3BuCdcPfXTV8+nt6KNOUHcG2y81xpe+kfEzTgFrJPMAKbhxJ9F668HrBwW+F+4/Yv1VqeXARLsduI459OWhw8VNTi/2b5aR5D59dV4J0uzygG01wYQpTX5JS66bZR5WUIYn2QTDhaDml9kF4yH+YRkjFlS3L46lcWqn/a0vXC4RvoA1bt0bSk9RiP1Rz/JWTtE4wMEUDAMJ9pdIe04FgTixRIGrTq91+3LKktLTHeTXlKqeSiUYl6Vy2TfxS7b1BbB5LAXK54EqYaBS1lnmApRupqvL1JKSmA1V5q5lDTRWq9tUQ3bhRUFpPFzo9BfuZoBt/6kQLRpWJXafUclF1sPrz6KlUw3ZFHWX19KIn+CCf+nOoliB4s7suAqp232CevvQ0qSckbc92gK2UampUC6Hvpv2h76kn8bffeSd2nwTKfc+AngD1ZnltUx13tZ/VObrcupXuo0rLUAm7D8KddO0+t3TzU62i1tF+0+zYqgGLK1vWx1OpND1Jq8ZN+y14oWz45lTtegE93eu4i5tVvBK12g/VHH+lJK2jffLiqFE+j22mSnNMB4I5sZQ3aa62NNsv9z3KpaU5zgNpylWO9m3Sq3ICCsb0Pw9mj9dPfY7rIyfV3hsk+O4BHWe6ZqtDuyZaTfq/Ba/K0XcrNRIVyFrmAVZbFTzZqa3fpqFlgtoPNWnYtPYu6FuStnM7UK3gZc82eC2yoOmTlz2jlgiwKqQTVE9apTpQonp6dYYufuqbkcXUGG2FnrTVzKbjrlxneCBLqg1STY9qTu1ggiLSVCX6LqolTqrpArJEgFUhVdXTObJ1qFkg6OAeZvO1N0HfIDWd2DSgNekdlTr29F6/artE5IHKHvSdtX1qgdZGgIVcUN8M9csI+mSoj43N055odFXQdPrlli2RdKC1aQJmHX+VzF+XVyq7voO+i00DWhsBFgAAQMYIsAAAADJGgAUAAJAxAiwAAICMEWABAABkjAALAAAgYwRYAAAAGSPAAgAAyBgBFgAAQMYIsAAAADJGgAUAAJAxAiwAAICMEWABSHTsq6/choP7K6K8dn0AaG8IsAAk6jZtrOswZlBFlNeuDwDtDQEWgEQ2iEpi1weA9oYAC0AiG0AlsesDQHtDgAUgkQ2gktj109q851Aqdv20Nm7bm4pdHwAsAiwAiWwAlcSun1bXB8anYtdP6zvdHk7Frg8AFgEWgEQ2gEpi10/LBlBJ7Ppp2QAqiV0fACwCLACJbACVxK6flg2gktj107IBVBK7PgBYBFgAEtkAKoldP62Lnpyail0/rXOvGZiKXR8ALAIsAIlsAJXErg8A7Q0BFoBENoBKYtcHgPaGAAtAIhtAJbHrA0B7Q4AFINGNs990P5/0YkWU164PAO0NARYAAEDGCLAAAAAyRoAFAACQMQIsAACAjBFgAQAAZIwACwAAIGMEWAAAABkjwAIAAMgYARYAAEDGCLAAAAAyRoAFAACQMQIsAACAjBFgAQAAZIwACwAAIGMEWAAAABkjwAIAAMhY5gHWpClT3M3/+Ifr1KmT+8EPfuBuufVWt33Xrki+wNETJ1yv++93Xbp0cV3POsv/fvjo0czSraT8SekAAABJMg+wLvntb930GTPc/kOH3N4DB9ygwYPddddfH8kXGDx0qHu4d2+3ecsWt6mhwf/et1+/zNKtpPxJ6QAAAEkyD7Csw8eOuc6dO0eWB3r06OGWr1zZ9HnVmjXugu7dM0u3kvInpQMAACRp9QBr2YoV7o9XXx1ZHlBT4r6DB5s+63ctyyrdSsqflA4AAJCk1QKsDh06uNNOO83/3LB5cyQ9oDzHT51q+nzs5Em/LKt0Kyl/Urq1saHBzZs/HwAAFJzu6fY+X61WC7BOfPWV27F7txswaJD76w03RNIDqh1SM2LwWTVGHTt2zCzdSsqflA4AAJCk1QKswJ79+/2IPLs8oD5Pa9avb/q8cvVqd363bpmlW0n5k9IBAACSZB5gXXb55W7Ohx+6Q0eO+OkZXho71t3Ys2ezPGedfbZ7cfRo//szQ4a4h74etdewdasftfdYnz5NeVuaLmqmrDR/UjoAAECSzAOsd997z899pWY1BVL39erldu/b15S+Zt06d/rpp/spHPT5yPHj7p777vMjDbt27erubfz9YGNwFuRvabqEA6yk/EnpebFj3yF3+PiJyHIAAFB/mQdYSV4eN87ddc89keVI54H+01znHo+5q/85yg0cPct9+NkGd/gYARcAAHlQ8wDrjjvvdJ8uXhxZjnRufniC+063h5vpfOFj7g+NAVf/UTPdB4vWu4NHCbgAAKiHmgdYyM6eg0fdux+ucI8Me9f99u/D3Xcv6N0s4Op04aPuyjtecE+OfN/NWbjWHTh6PLINAACQPQKsNmTvoaNu+ryV7rHh092lNz/vvte9ecDV8TePuituG+n6jZjhZi1Y4/YfIeACAKA1EGC1YfsPH3Pvf7La9X3+PXfZrSNcx18/0izgOr37I+7SW0a4Po3pMz5e5fYd+mb+LwAAUD0CrHZENVaquVINlmqyVKMVDrhU46WaL9WAqSZMNWJ2GwAAIBkBVjumPllzPl3rnnrhfXfVHS/6PlvhgEt9ui65abh75Nl33DtzV/g+X3YbAAAgigALTQ41BlwafahRiBqNqGkgwgGXXNRzmOs95G33VmPAtXP/4cg2AAAAARbK0LxaHy3Z4Aa8NNtdc9co1+WixyMB14V/e9Y9+Mxb7o05y9yOvYci2wAAoD0iwELFNHP8x40B16Axc9y194x2Z1wUreH69Q1D3b8HvummzfrCbdv939n6AQBobwiwULUjx0+6+Us3uSHjPnDX3TfG/U9MDVe3vwzxs85Pfv9zt3hlg9u+52BkO2hfNAHuB4vWuVUbd0TSAKCtIMBCZo6ePOUWLtvsnh0/1/2511j3/Uv6RAIuUc1X978OdX+5/2Vf2/XsKx/6Gq9Pl2+m1qsN0ujV2QvWuCdGznC/v/2FZqNXNU3IS1MXuF305wPQxhBgodUcO3XKLV7xpRveGED9/aEJfrb5sy57IhJwWXrlj2q+VCum2q+h4+b6GrAFX2xyDTv3R/4O8kXzr82cv9r1e/49d/mtI2PnX/vdzc+5H/y2b7P/uV7/pOlBjp44GdkmABQNARZqTjfgZeu2uffmrXKjJs/38279o/cEPwfXj654MhJwWaoBOf+6Z9y197zk7nt6qntm7Bw38b0l7uPPN7ovdxCA1ZomqNX/8vHnprtL//G8D6Ca/b8aAywFWgq4ZjYGXvr/az0NolDNpWoyw+v8+PdP+alBlq7dFvlbAFAUBFjIHc3PtXLDDj8L/ZhpC/xM9Lc+8pqfjV43XxtwWZow9VfXDvIjH+99coobOGa2e+3dz9y8zza4jdv2Rv4e0tEEtO9+tNI9+vU7MO0rmTSfmpoC1SSopsFK3oG5ddcBX9OpUanhbfW48Vk34rV59N0DUDgEWCgc1Xys3rTT37xffmOhv5Hf/tjrfnb6n/2hfyTginPuNQPdHxsDsLufmOwGjJrlJryz2H3YGICt37LHHT/1VeRvtme7Dxxxb89d7h4Z+o67uOewyL5U894f7nzRPf3iTN95XZ3Y7TbS+GzVFj/X2o8u/6Y2U7VgN/xrnJ8ORKNZ7ToAkDcEWGhzNLpxzZe7/Cz149/81M9Uf2efiX62+l9UGID94o/9fdDwz76TfOCg7Sh4WNuwu833Edqx75B764Pl7uHBb/saJLtvNAGtglMFpgpKNUGt3UYWtJ/1BoGbHnql2VsGul7az/1r4Bt+UIRdBwDyggAL7Y4636/bstvNXbzeTXh7kQ8U7u432c9ef87VAyIBRZyfNwZqaga74/GJvgbt5cYATDVqazbtLFwNi5rfps3+wv1n0JvuN6aJTjTB7J/uHu2bWtXMqhpEu43WpqDvxcmf+M7x4bJpMISmCfmSwQ8AcoYACzBOfPWV76ulWezVd0sz2d/z5BTfp+uXfxro39FogxDrJ1c+7Tt23/roa75zt/qSzZy/2s/91NImtJZSf6epM5f6WiBNl2HLrvnMNIBAgwc+WbrR1wjabdTTivXbXZ/GfRpuDlY/MJX59feW1H3/AoAQYAFV2Lx9n5/VXjd0zWyv0Yya3V6jG+20BHHUWV8j7m7p/aoffTd6ynw/Em95Y/CgeaPs32sJ1e5MmvG5u7+xjOf/eXCkLN+/+HF3fa+xfjoMTYVRlCZQ1UTOWrDG3fbY683em6nvo8ENqm2z6wBArRBgAa1AQY1muVdgoyYsBTea10sBTrg/USlnX/aEbw67+aFX/Gi9FyZ94kfufbF2mx/FZ/9emII/BX4K+hTw2W1rAlhNjaAJXhct/9JPEGu3UTTaJ+PeWuSuvOOFZt9VgxnUBKzBC3YdAGhNBFhAHaiZTrPeq6lOM9+ruU6z36vJLu6l2pY6emtEnzqAa3SftqFmTDVh2rxn/raP+9u/x7nnJnzkX1ekmh9bnrZEAxH6j5oZ6U+nQQsarKB5u+w6AJA1Aiwgh9TxXLPgq/O55odSB3RNU6BO6GoCs0FU2A9/19f1/M94N/K1eW7J6q2+T5ndfnuhUY4KPMPvyVQAq8EJGpTAlBwAWgsBFlBAGlW3eFWDn07h+Vc/8lMqjJz4MbOfl6CO769N/8yPhgwPUtBoUA1C0MS2dh0AaAkCLADtil6nNPjlD1y365t3+NegAw022MmLpwFkgAALQLulUZMPDHjDN6sGgZYGIWhwgQYVFGVEJYD8IcAC0O4FL57+6wMvN5tmw794eug77vM1WyPrAEA5BFgAELJt9wE/4rLHjc3fu6iJTeNen6TXMlHTBcAiwAKAEjQK0794+opvXjxdSlt6fRKAliPAAoAESa9P0qt6bMBllXp9kkYw8nofoO0hwAKADLTq65MOMzkqUDQEWABQA+Ven9T5wm/epVhKS16fBKD2CLAAIAda+vokTTURfn2SmjHRevRy9CmN/ytN9bGlMXi2/0+AAAsACqAlr09C6+v4m0f95LXX3TvG9eo/zU9mO/G9Je6TpRv95Lb2/4m2jwALANoAvT7ps1Vbml6fZGtckK0+z7/nbn3kNXfpLSN8/zkbcFmnd3/EnXftM/51Tfc+NdUNHDPbv75p3mcb3Kbt+yL/TxQfARYAAC106Ohxt3rTTjdrwRo3dtpC12/EDHfbY6+7K24b6X561dORgCvOudcMdFf/c5QfoTpw9Cz36juL/QvLN2zdy4vJC4gACwCAVnbk+Em3dvMuN2fhWjfurUXuyZHvuzv7THRX3vGC+8Uf+keCrTj/e/UAP9ntXX0nuf6jZrpXGrfzwaL1bm3Dbnf05KnI30R9EWABAFBnCpDWbdntAyYFTgqgFEj94Z+jfGBlg604muxWAZsmu1UAp0BOAZ0COya7rT0CLAAAck6T3aqpUJPdqulQTYhqSlSTopoWv3tB8mS3aqrUZLdqulQTppoy1aS5auMO38Rp/yZahgALAIA2QJ3lNdmtOs9rslt1plenenWuVyd7G3BZfrLbW0b4yW7Vif+lqQvcjI9XuRWa7PYIAVhaBFgAALQDmuxW00ZosltNI6HpJDSthKaX6HTho5GAy/rR5U/+d7Lbhyf4yW5fnPyJmz5vpVu2brvbd4i3DVgEWAAAwE+YqsluNYGqJrt9YMAb7vpeY90FfxniOvdIfttA10v7uUtuGv7fyW6ffceNfP1j987cFW7p2m1u94Ejkb/X1hFgAQCARJrsdtHy/052O+zryW7/+sDL7tc3DHX/U8HbBn7w276ux43Pup7/Ge8eHvy2G/HaPD9vm+Zv27n/cOTvFR0BFgAAaLEdew+5xasa3Jtz/jvZ7UOD33I3/nt8Y1A1zH3/kj6RgMvSGwku/Nuz/g0Fz034KLL9oiHAAgAArW7X/sNuyeqt7u25y93I1+b5d2b2fPAVd1HPYf5dmuFg6/bHXo+sXzQEWAAAoO72HDzqvli7zb374QrfFGnTiybzAOv1SZPcpZdd5r77ve+5rmed5W659Va3Zdu2SL7A0RMnXK/773ddunTx+fX74aNHM0u3kvInpQMAACTJPMD61re+5Z4eMMDt2L3b7dq71/V74gl31VVXRfIFBg8d6h7u3dtt3rLFbWpo8L/37dcvs3QrKX9SOgAAQJLMAywFJOHP+w8dch07dozkC/To0cMtX7my6fOqNWvcBd27Z5ZuJeVPSgcAAEiSeYClgCr8ecbMmb7J0OYLdOrUye07eLDps37XsqzSraT8SenWxoYGN2/+fAAAUHC6p9v7fLUyD7DCFFyddfbZbv7ChZG0wGmnneaOn/rmLeDHTp70y7JKt5LyJ6UDAAAkabUA67kRI9xtt9/ups+YEUkLU+3Q4WPfTLGvGqNwk2JL062k/EnpAAAASVolwJoybZpbtmJFZHkc9Xlas3590+eVq1e787t1yyzdSsqflA4AAJAk8wDrvl693O133OGWLl/u1m/a5EcTHjne/C3cajZ8cfRo//szQ4a4h74etdewdavvJP9Ynz5NeVuaLh06dKg4f1I6AABAkswDLAUzcYL0NevWudNPP93tPXDAf1bwdc9997nOnTu7rl27unsbfz945JuXQrY0PShTpfmT0gEAAJJkHmAleXncOHfXPfdElgMAALQVNQ+w7rjzTvfp4sWR5QAAAG1FzQMsAACAto4ACwAAIGMEWAAAABkjwAIAAMgYARYAAEDGCLAAAAAyRoAFAACQMQIsAACAjBFgAQAAZIwACwAAIGMEWAAAABkjwAIAAMgYARYAAEDGCLAAAAAyRoAFAACQMQIsAACAjBFgAQAAZIwACwAAIGMEWAAAABkjwAIAAMgYARYAAEDGCLAAAAAyRoAFAACQMQIsAACAjBFgAQAAZIwACwAAIGMEWAAAABkjwAIAAMgYARYAAG3Quh373avz17her3zkfvf0G+6iJ6cWRt9pn0a+T9EQYAEA0Aas3r7PTfhkjbtv/Ifugj6TXdcHxheWvoP9fkVDgAUAQAGt3LrXjZu3yt398lx3/uOTIkFK975T3H2vfOSDrlXb9rrNew4Vxs6DRyPft2gIsAAAKIDljQHV2I8aA6qxc915j02MBFS/7jfF3T9hnnttwVrfPGjXR20RYAEAkDMnvvo/t2zLHjfmw5XuzrEfuHMfeT0SUPV4Yqr796sfu4mNAdX6XQci20B9EWAVlNqn7clWqZ8+9GqkQ2HWLn5ymrvx+fdRA3e9PNc9+Pon7u8vzIqk1dqfh78XORaqcc2QdyPbztpto+f4/VYpdbp9ae4KN33ZZvdFwx63+/CxyHkJVOv4V1+5z7/c7UZ/sMLdPuYDd07vaEClc+M/jcfipIXr3KY9ByPbQL4QYBXUvS0IsABk45zer7k/PPO2r2F44o1FvrZhRmMAtmzLXrfv6PHIeQsEjp9qDKg273Kj5ix3t46e7Y8le3xd8tQ099DE+W7qovVu895DkW0g3wiw2qHDx09GOhRmTU9Xn6zfjhp474vNbsqn69xHa7ZG0mpt0cadkWOhGksbdke2nbXZKxv8fquUgicFUQqmFFTF3RCtXz4y0f1x8Du+lvHJNxe5l+etcrOWf+k7J+8/diJybqLtOnrylFvceH6MbAyo/jFqtvvFw9HjR1MpPDxpvpu2eINr2Hc4sg0UCwEWAFRJzYRqLlSzoZoP1Yx4+0tz3O8HvR17A7XUUflPQ9/1o8D6v/2ZG//xah/4abj9ocYHIfv3UBxHGgOqTzfscM/PWuab73/+0KuR//9lA950j05e4N5astFt209A1dYQYAFAK9l16KjvV/Pu0k2+KejxqQt9c9DlA9/yfSHtDdfq9vgk96dnp/suAQPf+cxpuP3cVVvc2h373eETBGB5ov/HgvXb3fCZX7ibRs50P4v5/17R+H9/bMoC9/bnm9z2A0ci20DbQoAFAHWyo/Emu2TzLn/DVdORajNufnGWu3TAm+6nD0Zv0JYmk7x++Ht+pu5n3l3ih+d/uHqrH1GmJin795AdBVRqah42Y6kfNBEXMF/5zNu+VnP6F5vbxLxOSIcACwBySs1G6tf25mcb3IjZy1zvSfN9c5P66vzo3xMiN3TUl/rmPfHGp77JmFGmIMACgILa0hiAqZ+POkWraUojznqOeN+PPjv7X69EAgBk56x/jfcDGDR44f1lX7q9Rxg1iuYIsAAAADJGgAUAAJAxAiwAAICMtUqAdfjYMffRxx+7008/PZJmHT1xwvW6/37XpUsX1/Wss/zvh49+M9qipelWUv6kdAAAgCStEmB16NChiU2zBg8d6h7u3dtt3rLFbWpo8L/37dcvs3QrKX9SOgAAQJJWCbAClQRYPXr0cMtXrmz6vGrNGndB9+6ZpVtJ+ZPSAQAAktQ9wOrUqZPbd/Cbt4Lrdy3LKt1Kyp+Ubm1saHDz5s8HAAAFp3u6vc9Xq+4B1mmnneaOn/pmxuFjJ0/6ZVmlW0n5k9IBAACS1D3AUu2QOsUHn1Vj1LFjx8zSraT8SekAAABJ6h5gqc/TmvXrmz6vXL3and+tW2bpVlL+pHQAAIAkdQmwzjr7bPfi6NH+92eGDHEPfT1qr2HrVj9q77E+fZrytjTdliMpf1I6AABAklYJsMLTNNjpGtasW+fnx9p74ID/fOT4cXfPffe5zp07u65du7p7G38/eORIU/6WpgflqTR/UjoAAECSVgmwynl53Dh31z33RJYDAAC0FTUPsO6480736eLFkeUAAABtRc0DLAAAgLaOAAsAACBjBFgAAAAZI8ACAADIGAEWAABAxgiwAAAAMkaABQAAkDECLAAAgIwRYAEAAGSMAAsAACBjBFgAAAAZI8ACAADIGAEWAABAxgiwAAAAMkaABQAAkDECLAAAgIwRYAEAAGSMAAsAACBjBFgAAAAZI8ACAADIGAEWAABAxgiwAAAAMkaABQAAkDECLAAAgIwRYAEAAGSMAAsAACBjBFgAAAAZI8ACAADIGAEWAABAxgiwAAAAMkaABQAAkDECLAAAgIwRYAEAAGSMAAsAACBjBFgAAAAZI8ACAADIGAEWAABAxgiw6mxGwwb349dHug5jBrU6/R39PVuGNIpW3iKWmfKW1h7LC6CYCLDq7CcTX4hclFuT/p4tQxpFK28Ry0x5y2tv5S1aQEh5S8uivEUsc9HKmxUCrDqzB0ct2DKkYbdVC7YMadnt1YItQxp2W7Vgy5CG3VYt2DKkYbdVC7YMaRQtIKS85bW0vEUsc9HKmxUCrDqzB0Yt2DKkYbdVC7YMadnt1YItQxp2W7Vgy5CG3VYt2DKkYbdVC7YMadht1YItQxp2W7Vgy5CG3VYt2DKkZbdXC7YMadht1YItQz0QYNWZPShqwZYhDbutWrBlSMturxZsGdKw26oFW4Y07LZqwZYhDbutWrBlSMNuqxZsGdKw26oFW4Y07LZqwZYhLbu9WrBlSMNuqxZsGeqBAKvO7EFRC7YMadht1YItQ1p2e7Vgy5CG3VYt2DKkYbdVC7YMadht1YItQxp2W7Vgy5CG3VYt2DKkYbdVC7YMadnt1YItQxp2W7Vgy1APhQ+wjp444Xrdf7/r0qWL63rWWf73w0ePRvJVmj8pPWv2oKgFW4Y07LZqwZYhLbu9WrBlSMNuqxZsGdKw26oFW4Y07LZqwZYhDbutWrBlSMNuqxZsGdKw26oFW4a07PZqwZYhDbutWrBlqIfCB1iDhw51D/fu7TZv2eI2NTT43/v26xfJV2n+pPSs2YOiFmwZ0rDbqgVbhrTs9mrBliENu61asGVIw26rFmwZ0rDbqgVbhjTstmrBliENu61asGVIw26rFmwZ0rLbqwVbhjTstmrBlqEeCh9g9ejRwy1fubLp86o1a9wF3btH8lWaPyk9a/agqAVbhjTstmrBliEtu71asGVIw26rFmwZ0rDbqgVbhjTstmrBliENu61asGVIw26rFmwZ0rDbqgVbhrTs9mrBliENu61asGWoh8IHWJ06dXL7Dh5s+qzftczmqzR/UnrW7EFRC7YMadht1YItQ1p2e7Vgy5CG3VYt2DKkYbdVC7YMadht1YItQxp2W7Vgy5CG3VYt2DKkYbdVC7YMadnt1YItQxp2W7Vgy1APhQ+wTjvtNHf81Kmmz8dOnvTLbL5K8yelW88MGeIDMAAAUGy6p9v7fLUKH2Bphxw+dqzps2qcOnbsGMlXaf6kdAAAgCSFD7DUZ2rN+vVNn1euXu3O79Ytkq/S/EnpAAAASQofYKk676GvR/01bN3qR/091qdPszwdOnSoOH9SOgAAQJLCB1hHjh9399x3n+vcubPr2rWru7fx94NHjjTLEw6wkvInpQMAACQpfIAFAACQNwRYAAAAGSPAAgAAyBgBVkFpfq6P58+PLAcAoC0o+n2OAKug1m/a5G659VZ34quvImkAABRd0e9zBFhtwNoNGyLLAKDIFn32WWQZ2q8i3ucIsApuz/797qyzz3YTJ0+OpKF9WrRkibvjzjvdxi+/jKQBRTB33jz3i1/8wu3csyeShvanqPc5Aqw2YNmKFYU5+D78+GN39733uv88+KBbunx5JD1vilZeHQM6Fsa8/LLbtmNHJD1v3njrLfe///u/7pxzznFvvP12JD2Pilbm6TNmuGuvu871vOmmQvRnUU1Fz549C1ODVbRrRNGO30CR7nMBAqwC0w10y7Zt/vciHHyTpkxxP/vZz9ycDz9070yf7n704x+78a+8EsmXF0Ur7/Zdu9zZP/qRW7dxo/+sSXNVm5XXiXJ1A/3pT3/q9++cuXPdT37yE/fS2LGRfHlStDK/2XgD/XHjcTtl2jR/bdAxPHbcuEi+vAhqKi7o3j2SlkdFu0YU7fi1inCfCyPAKqhpb77punTp4mec1+t8jp86lfuD79xf/tKtWbeu6bMCAV2QFATYvHlQtPLOmjPH3dj45K/f3581y/385z/3x8Mvf/Urd+Dw4Uj+elIthTqvzpg5s2nZhs2bfZnzesHPc5lLjba6+OKL3YpVq/zvny5e7LqedZabOXt2rms3834dC8vrNSLueCja8Vuqpq1IxwcBVgEdPnbMH2B6EfWuvXvd76+80t12++3Ngiz9tOvVyiOPPRZ7wnaPeSrVya5XE9nleVC08upY0MX9vPPP9zfSyVOn+uV/veEGH3zZ/PUS1FKce+65kbS8XPCtvJdZo63ibjqXX3GF/xkOrvT55n/8I3JDy5Oi3ETzeo2wo++Kdvwm1bTl4T5XCQKsgtGTUf+BA/1NM1imJqCrrrqqKcjatnNnZL1aKnXCXv/nP7sXRo1qtkzf5+833xzZRh4UrbyiTsGzP/jAHfq6WVA1Fbo4fbl1ayRvPZW7ger4eX7kyMjyest7mePKp35XvR99tFlwtXzlylw1wZXqIxb3ffLgkwULmn4vwjUiGH1Xbn/m7fitpKat3ve5ShBgFYja+PUCalX7a4RNeJRYOMjKw5whcSdE8JQy6qWX/Gf1H1Nti/qJ2PXr4bWJEwtV3nKdaxVo68lPx8mIF16IrJsH5S74eZX3Mtvy6TzUNeOue+7x1wXdbNWspUEQdt16SOojloeaCp1n6mul30ePGdNsdGPerxF29J09PvImKF9ea9rSIsAqCF0YL7rooqYb6bPDhvmDzQZZr77+emTdetDTx/ndurkzzzyz2QmhPgp/vPpqd+GFF/ryj3zxxci69aDydrvgAnfGGWcUorxJnWtXr13rawXy1DQYFxDm+YL/1jvv+Au9AoDweZXXMgc1K7Z8Ooavu/56f/146OGHc1XuSvqI1bumItif/7zrrsiDreT1GlHqeLCf86Zc+fJQ05YGAVYBBE8hCljCy58fMSISZOWBghW1n3+2dGnJp47DR4/6jo123XpQh3AFK7rAF6G8ktfOtaWUCwjzUEthKaBSeRWg6njOYx+QcjUr5W5SeVKUPmJ9+/VzHTp0cMOfey6SFqj3NSLN8ZCH47ccW96iIsAqiFIHXBBk7T1wILJOvfTo0aNZk1WpoCUvrr7mGrdqzZqmz3kvr+S1c20pSQFhvWspwjR4ROUNHlz0WeeearLy1AckqWal1DWjnsJTy0gR+oip64D6VL373nux+3PfwYORdeoh7fFQ7+M3oAcu1bCq3Is//7xpuS1vERFgFUipA27hokWRvPV05VVXRZbpovmtb30rl0FLXIdUnegqb16aXK0idK4NdwbOa0CoEbnDhg9vdlyqFmLr9u3+9x27d/ub1dQ33vCB93e/+93cHMPav0k1K3mqqYibWibvfcRs14FgfyroUrqCFAWDeak5LtLxIPM++cQ/uGgaBh0fqjWe8NprTel5K29aBFg5VbT+H2HqZ/Pi6NHNluk7aGRIHtvPdXG3N031cdNFSjVZeXxdRx4715ZroshjQDh/4UJfi6bjNRwMhqmp6ukBA/zvqmHR96jXMRy3fwcNHpxYs5KHmopyU8vktY9Yqa4DugaryVhl1k9dK+y69aJjM4/HQ9w8VwqmtQ/Dy3Vd0z7VuRksq0d5s0KAlUNF6P8RZieE29TQ4Ms3fsIEn65mAV2c8vKUZ4eFq7yaAT3oE6TaC30XNbve9Pe/+9F4dhutLXwzLSVvnWvLNVHkLSDU/1jBVXgouKUbkmpcNOWFjmGdk/U8hsvt3zzXrFQytYxdJw/KdR1QzaZGO+bldT7ax+H3j+bteLDzXAX9in/zm99E8uq+d9nll0eWFxEBVh3FRfVF6f8RKDUh3Jr1630HVtUA6Ps8N2JEZN16KDUsXOX93aWX+hqK4CKqTvpqvqhHDVaamsp6d64NK9dEkaeAUH0XH37kkWbL1NQ+YNCgptqsoydO+OP5rrvv9j/jvlOtldu/eaxZKdLUMlZc7Woeuw7oGqFrhX3/aN6OB3tNs58DqjHUZNV2/SIiwKojO9uuFKX/h1Ty6gWd8PsPHYqs29rigldJGhaufa/mjODkV+2c3UatlLoABfTuwWC29ryopIkiDwHhM0OG+M7V+l3n2a233eb7BqlPmGozg2NaE7SqabNeT/5W0v7NU81K0aaWsYrQdSDp/aN5Oh7EXtPsZ11/9WqvUk32RUOAlRPBbLtheer/YRXh1Qs2eJVKh4U/9fTTdWkatOwFKKALq6r8g+Oj3vLeRGEFTYR6d6N+qjlITcVKUy2FmpDtOnmS9/1btKll4uSx64BVpPePBuw1Lfis/ndqhq9nzXbWCLDq5IOPPnJz583zv9vZdiVv/T/i2BMlLE8TwoWD1yIMC7fsfs5bcFWUJgpLT/eqPbFPy2oa1sOMzV9PcYNe8r5/7XEbyOPUMrYfabA8b10HAjoGVJaivH/UsseGPv/gBz/wx4bNW2QEWHWig6tTp05NQZY94PLY/yOOLXfe2OA178PCSwn2s0Zn5im4KloTRZKGrVvdr847r65Nw1a5QS9537+lrg95mlqmVD/ScJ48dR2QcCtBEd4/agcWaZk9NuzntoAAq0563X+/u/2OO/zNvlSQlbf+H3FP0WLLnTe2fHkdFp4keMrLS3AlRWyiiKN+eRrpplqA555/PpJeL5UOesmLPL8OKa5fZiX9SMPy0nVAbDnz+v7RUgOLlBYcG/oZfFafY7uNoiLAqhP181DVsyZaKxdk5UW5p2ixJ0o96AKjp1GVMdxUJXndr2nlZfRooKhNFJaOD/UhC2ri8qJIg17y/jok2y8z7/1Irbh+uuFy1vv9oxr5F7e/kgYW5e2aliUCrBqJe5rXK2X0+pBSQVY9LkZxT3mVPkXX80RZ8sUX/iZ/yW9/6/52442+puf+Bx7w1fpBnrYSZOVNEZoo2oI8D3qRIr0OKQhWyl0T8tSP1HZ1CFOfsDy8JaNUUFrpwKK2iACrBlRt3rFjR/8KGdUEBf1TNOlivyee8L/bIKteFyM7IZzk/SlaAwa078ITc6oDrebX0eiw8JQA9Qxe24q4ZiDJaxNFW1CEQS95fR2SZYOVckFWnpQqp5rb7uvVKxfBYFyQVcSBRVkhwKoBnRg//OEPffV0z5493ZlnnulvULr46KkvmMk4CLJ0kNpt1FKpE1ny9hStm71qq7TvbJr2q/paBbOHB+oVvLYF5ZqB6t1E0RbEdQaWIgx6yePrkEqx1zj7uZ70wKh3NcbdB4JyBu/rU7CtczA843w96Z6mqTl0jwuCrKIOLMoCAVaNhE9gNanoCV8zWmtW5vCFNJiLp97iLjh5fIqOK2eYynfxJZdElqM6Sc1AqF65zsCSt0EvmoMrXFORt9chJbHXjjzUbgeBtDrT61jQfFtqWgvnUflUS6zuECpvXgZlKLjSaEw1WdqarKIOLGopAqwasie0qPNfvWe1toIh37a8eX2KtuUMUyCoNLsc1SlKM1ARJXUGzhP9z7tdcIE744wzmgVZeXgdUlw/0lLzXNlrRx5qt1XTM278eN9/VD8VpOrdfApUg9YOPexqRv+81FyJ+hSHuwzYIKs9IsCqMXtC5436gOnpKJhEz5Y3b0/RAVvOgC5QenKy+VGaRriqKVuj6uzNvUjNQHmmm+ew4cOb3XyK0hlY03Go9lrlLHUTrefrkGw/0qR5rvJQcxWm/kkKqoLRjvqpAPHb3/62DxJ1/sUNmqo39TG2y/Rd8tABv14IsOqgVDBQb2ob143VTlqY1/JatpyaNFKTYKpPg82LeNpX6i+oJuyHevf2/SnCN8qiNQPl0fyFC33zn/phhmeRL0pnYA0cCdeclAqy6il8Lahknqs81FyFqR+e+jjqdwXjf7r2Wj9oR81v/7jlltw0C4bpeNZEyOFlGtSl/V/Pfrr1RIBVJ3l7agpG1pS6mOetvKUE5QxmPB88dGgkD+IFAwbCtSW60OvJXzeq4H+fh2agogregRi+4Qfy3hk4CAbjaitV66maijy9uDm4FhRlnqsw1bSpWTAcXNWrRrBS6j+s/T1+wgT/WbXf2sd5a+2oJQKsOqr3U5OaAcPvA7M1QFa9y1spfY+8zXheBPb/r5u8qv3VLKGOqUoLz7Jcz2agotK71h5+5JFmy/TamAGDBvkAJk+dgRVwB1OfjB4zpqnrgAJAG5joPYjqk6kbaj3f0WfZYzosT/NcxVF/Rz3E5DG4KvVWD727UU3datbWw8FzbezdgmkRYLVDetrUyDq9C/F7p5/un5A0eajSyl2Q8qBUZ1WrKMFg3oT//xoqruNEs7UrTf3zNHLJroPKPTNkiG8G1O+aU+7W225znTt39oME1JwdV7NVL8Gx8M+77vLBVTDRsGoqVNZgeg7Vyul81MOaRr3V+1UyqjFR/8GgvHm/ppWiqRg0kCBvwVXSWz1EtVf7Dx2KrNveEGC1M58vW+abITQUXCNS9HJenRxaVuolnHmR1FkV2dD/X/2w9D7BcA2nZmtXs4XNj8oFTYR6f6N+qj9TMDWLHnzUJGvXqae+/fr5qWTsiGHVVOhVXxr0EDS1qX+QriP1rMHSNUvXLjWrhgdo5PWaVo6uzaoh0r62abUQNxqz0rd64L8IsNqZ3195ZWw/CXVu1omip2p9zlufq7QvZUXL2BvS9l27/IW1SDeovNI5pnMw3MFdFKAoYLH560lNaJoOIC440VQBChjVTyg4XlTDbLdRKzpGVbMWvE9SAYpqs4I3Z+TtmlYJ1XjGXa9rwY7GlLy/1SNvCLDaEc1jpaG++mnT5N//+Y978qmnmj7npZmtaC9lbSuCG1IwYKD/wIGRPMiGRrz+6rzz6hqglBMcC5pcVJ91bdAxEXRg1sSY9W4aVJOVagb1u6aS0HVBZVZNbDCtQV6uaZUqda1uTeGaK/ugFZa3t3rkEQFWO6JOy+rvEdRSWXpNh0aH2eV5UO5Ez3tn1SLTfmfAQOvRxKIKXDU1Q16G3pfq56hjQc3y6oSvn+rYbtetJ/UVVLOrpg3R/pw8dapf/tcbbuD1TSmo5kqtBcE8XHHX3jy+1SOPCLDaGc3C3qdv38hyUS2QTiy7PC/iTnS0vqI99ReJjml1yA6ateotqZ+jHs70+h47V1692NFs6v+lvoK68StdN399B02QbNdFMnXN0E977c3rWz3yhgCrnQk62QYjgALBU4hGitl16sFeOIPl9kQHkI2i9XMsN5pNA3gUIKqPkCbNtesiWdA1I7jW2mtvXt/qkScEWO2QRn6oCUD9FXSRUtNEnqr8y104pYidVYE8K0I/R827FvyeNJpt9dq1fkQmTYMtY4Mq+xnlEWC1U6pC1wzcmpX5vl693IJPP43kqYekC2eQj2YrIFvlbp717ueoEYK//vWvmzp9M5qtduxxwQNu5QiwkCtcOIHa0Ezten/cfx580C1dvtwvszfTPNG7GjUTvl3OaLbqxM1zVW6AQ/i44AG3MgRYqCvNoTNs+PDYwIkLJ9A69AocNcOrM7teKhzul2lvpnmhCVlVkx28WUAYzVY9O89V0gAHaq7SI8BC3cxfuNBf2PUUbSdd5MIJtB41w69Zt67ps0Yx6lwMzrG83kw18eaDDz3U9JnRbC0TDqYrGeBAzVU6BFioi2A0Y6l3r3HhBFqPXiRsl+lc1DsRg8/1vpkOefZZN3jo0Gav3tHs7Ho/Xzg4ZDRbdbTfNHAgCLLyPMChqAiwUBfqS/HwI480W7Zw0SI3YNCgptosLpxAy+k1WHb6FTW369wKL9N5pkEvdv160Y3/8iuu8KObH+rd233xdW2augvc8Le/RfKjMmoKVIB98cUXuzPPPNPPzl+uWbjeAxyKjAALdaGq/t6PPup/V2f2W2+7zc8yrydovU+sVM0WgHR04+zUqVOzICvofzPqpZf85y3btvkZ0N8MdWzOgyt+/3tfW6VaLF0vNPWCyqjZ2W3QiGQKtvUi9+CVTEFgpTcKlAuyUB0CLNRF0ESoubj08+prrvGdWJW2+PPP/YXUrgMgvV733+9uv+MO17Vr12ZBifpd6dVYF154oW8G0rQtdt1a0suu9x440GzZ65MmNetztXnLFt9nU/0zVe7gdS5IplGjeu2VHTmo5WqO1e8EWdkiwELdqOZKk4raDu660KoJw+YHkJ4eWH536aVu3iefRIIsUT8cDdm369Vavyee8KPYFFQFyzTKWNMG7D90qFleTSRq30aB8koFT9rv4dnu8zrAoYgIsJArDVu3ul+dd15TFTaAdA4cPhxZ1qNHD9/UVirIygvVqmm+qyuvvNI3W2nZo48/7l4cPTqSF+nZIEsPt3oxth3QYD+jOgRYyAVdTPsPHOhPdr26x6YDSKbmno4dO7orr7rK1w4f/Pqlx+prpZoK/Z73IEt041cHdwVXmgT1/G7daA7MSBBkPfX00/56q3mvbB5kgwALuaCT/o477/RPsDYNQGV0HqkTs+Y06tmzpx8lpj5LGjSiua/0EmTlC4IsjRCz28iTyVOn+o7u3//+993sDz6IpKM6Ok7UHysYaITWQYAFAG1IuBlIo+/Uv0Ydwjt06NCsg3MwqCTv1A9LUzXQ5ypbtrkQ2SPAAoA2Ju7mqWb4PHRmR37Qob11EWABQBsUF2QBFh3aWw8BFgC0UQRZQP0QYAFAG0YzEFAfBFgA0MbRDATUHgEWAABAxgiwAAAAMkaABQAAkDECLAAAgIwRYAEAAGSMAAsAACBjBFgAAAAZI8ACAADIGAEWAABAxgiwAAAAMkaABQAAkDECLAAAgIwRYAEAAGSMAAsAACBjBFgAAAAZI8ACAADIGAEWAABAxgiwAAAAMkaABQAAkDECLAAAgIwRYAFAGR06dIgsA4AkBFgA2rVlK1a4v/z1r65Lly6uY8eO7qKLLnJTpk2L5BOCLQCVIsAC0G41bN3qunbt6p4fOdJt27HDbdu5082YOdPdetttkbxCgAWgUgRYANqtu+6+2w0YNCiyPCwIqvTT0vLzzj/ffbFihf996fLl7vxu3SLbAND+EGABaLfOOvtst3bDhsjysHCtVVwN1hNPPumeHTbM/z78uefc0/37R/IAaH8IsAC0W9/+9rfdoSNHIsvDkgIs1Vr98eqr/e9/uvZat3zlykgeAO0PARaAduuHP/yhW712bWR5WFKAJRd07+727N/vO8jbNADtEwEWgHar5003uf4DB0aWh4WDqtNOO80dO3kykqdP377u8T593FNPPx1JA9A+EWABaLfUOf2MM85wz40Y4bbv2uV27N7tZs6e7S67/PKmPOEA65xzznETJ092x0+daradxZ9/7r77ve/5KR/s3wDQPhFgAWjXFi1Z4q697jrXuXNn953vfMd1797dDRo8uCk9HGDNmjPHnfvLX/q+W5reIViuwEyjCe22AbRfBFgA0ELDhg93Tz71VGQ5gPaLAAsAWuiXv/pV01xYACAEWAAAABkjwAIAAMgYARYAAEDGCLAAAAAyRoAFAACQMQIsAACAjBFgAQAAZIwACwAAIGMEWAAAABkjwAIAAMgYARYAAEDGCLAAAAAyRoAFAACQMQIsAACAjBFgAQAAZIwACwAAIGMEWAAAABkjwAIAAMgYARYAAEDGCLAAAAAy9v8B4Z5gkIVJe24AAAAASUVORK5CYII=';
  };
  setDataValidationAfterRow: (row: number, colConfigs: DataValidationColConfig[], urls: string[]) => Promise<void> = () => void 0;
  translateText: (text: string, sourceLanguage: string, targetLanguage: string) => Promise<string> = () => void 0;
  setFormula: (formula: string) => void = () => void 0;
  transposeTable: () => Promise<void> = () => void 0;
  getValues: () => Promise<string> = () => {
    // return Promise.resolve([
    //   [
    //     '指标',
    //     '居民消费价格指数(上年=100)',
    //     '城市居民消费价格指数(上年=100)',
    //     '农村居民消费价格指数(上年=100)',
    //     '商品零售价格指数(上年=100)',
    //     '工业生产者出厂价格指数(上年=100)',
    //     '工业生产者购进价格指数(上年=100)',
    //   ],
    //   ['2022年', 102, 102, 102, 102.7, 104.1, 106.1],
    //   ['2021年', 100.9, 101, 100.7, 101.6, 108.1, 111],
    //   ['2020年', 102.5, 102.3, 103, 101.4, 98.2, 97.7],
    //   ['2019年', 102.9, 102.8, 103.2, 102, 99.7, 99.3],
    //   ['2018年', 102.1, 102.1, 102.1, 101.9, 103.5, 104.1],
    //   ['2017年', 101.6, 101.7, 101.3, 101.1, 106.3, 108.1],
    //   ['2016年', 102, 102.1, 101.9, 100.7, 98.6, 98],
    //   ['2015年', 101.4, 101.5, 101.3, 100.1, 94.8, 93.9],
    //   ['2014年', 102, 102.1, 101.8, 101, 98.1, 97.8],
    //   ['2013年', 102.6, 102.6, 102.8, 101.4, 98.1, 98],
    // ] as unknown as string[][]);
    return Promise.resolve(JSON.stringify([
      [
        "City",
        "Sales",
        "Orders",
        "Revenue"
      ],
      [
        "Denver",
        "$6,600",
        33,
        1800
      ],
      [
        "Dallas",
        "$5,500",
        34,
        1900
      ],
      [
        "Houston",
        "$4,200",
        35,
        1800
      ],
      [
        "Phoenix",
        "$3,000",
        32,
        1700
      ],
      [
        "Huntsville",
        "$2,800",
        31,
        1600
      ]
    ]) as unknown as string);
    // return Promise.resolve(JSON.stringify([
    //   [
    //     "Questioin",
    //     "Answer",
    //   ],
    //   [
    //     "如何解释黑洞内部的奇点对于我们对宇宙本质的理解有何重要性？",
    //     ""
    //   ],
    //   [
    //     "在生物多样性丧失的背景下，生态系统功能的稳定性如何受到影响，以及这对人类的生存和发展有何潜在影响？",
    //     ""
    //   ]
    // ]) as unknown as string);

    // return Promise.resolve(JSON.stringify(
    //   [
    //     ["中药名", "功效"],
    //     ["苦地丁", "清热解毒。治温病高热烦躁，流感，传染性肝炎，肾炎，瘰疬，腮腺炎，疔疮及其他化脓性感染。"],
    //     ["甜地丁", "清热利湿，解毒消肿。治疔疮，痈肿，瘰疬，黄疸，痢疾，腹泻，目赤，喉痹，毒蛇咬伤。（体质虚寒者忌服）"],
    //     ["紫花地丁", "清热解毒，凉血消肿。用于疔疮肿毒，痈疽发背，丹毒，毒蛇咬伤。"],
    //     ["石见穿", "治噎膈，痰喘，肝炎，赤白带，痈肿，瘰疬。"],
    //     ["寻骨风", "治风湿关节痛，腹痛，疟疾，痈肿。（阴虚内热者忌用）"],
    //     ["积雪草", "清热利湿，消肿解毒。治痧气腹痛，暑泻，痢疾，湿热黄疸，砂淋，血淋，吐、衄、咳血，目赤，喉肿，风疹，疥癣，疔痈肿毒，跌打损伤。（虚寒者不宜）"],
    //     ["泽兰", "活血，行水。治经闭，癥瘕，产后瘀滞腹痛，身面浮肿，跌扑损伤，金疮，痈肿。（无瘀血者慎服）"],
    //     ["佩兰", "清暑，辟秽，化湿，调经。治感受暑湿，寒热头痛，湿邪内蕴，脘痞不饥，口甘苔腻，月经不调。（阴虚、气虚者忌服）"],
    //     ["千里光", "清热，解毒，杀虫，明目。治各种急性炎症性疾病，风火赤眼，目翳，伤寒，菌痢，大叶肺炎，扁桃体炎，肠炎，黄疸，流行性感冒，毒血症，败血症，痈肿疖毒，干湿癣疮，丹毒，湿疹，烫伤，滴虫性阴道炎。用于风热感冒、目赤肿痛、泄泻痢疾、皮肤湿疹疮疖。（中寒泄泻者勿服）"],
    //     ["农吉利", "清热，利湿，解毒。治痢疾，疮疖，小儿疳积。近试用于治疗癌症。"],
    //     ["瞿麦", "清热利水，破血通经。治小便不通，淋病，水肿，经闭，痈肿，目赤障翳，浸淫疮毒。（脾、肾气虚及孕妇忌服）"]
    //   ]
    // ));
  };
  setValues: (values: string[][]) => Promise<void> = () => void 0;
  insertImage: (dataUrl: string) => Promise<void> = () => void 0;
  setUserProperty: (key: string, value: string) => Promise<void> = async (key, value) => {
    await this.sleep()
    setLocalStore(key, value);
    return Promise.resolve();
  };
  getUserProperty: (key: string) => Promise<string> = async (key) => {
    await this.sleep()
    return getLocalStore(key);
  };
  getRowColNum: () => Promise<{ col: number; row: number; rowNum: number; colNum: number; }> = () => {
    return Promise.resolve({
      col: 1,
      row: 1,
      rowNum: 12,
      colNum: 4
    })
  };
  checkUser = async (): Promise<IUserOrderState> => {
    // await this.sleep();
    // const res = await api.checkUser({
    //   data: {
    //     email: 'hongyin163@gmail.com'
    //   }
    // })
    // debugger;
    return Promise.resolve({
      state: 'paid',
      email: 'hongyin163@gmail.com',
      order: null,
      version: 'standard',
      gpt: 0,
      exp: Date.now(),
      gptLimit: 20,
      noApiKey: true,
    } as unknown as IUserOrderState)
    // return Promise.resolve({
    //   "state": "free",
    //   "gptLimit": 13,
    //   "version": "basic",
    //   "email": "sally.wait.you@gmail.com"
    // })
  };
  getRangeA1Notation = async () => {
    await this.sleep();
    return "B6:E25"
  };
  insertText = async () => {
    await this.sleep();
  };
  runScript = async (code: string) => {
    console.log(code)
    await this.sleep();
  };
  getSheetInfo = async (): Promise<{ current: string, sheets: string[] }> => {
    await this.sleep();
    return {
      current: 'Sheet1',
      sheets: ['Sheet1', 'test']
    }
  };
  getValuesByRange = async (): Promise<string> => {
    return Promise.resolve(JSON.stringify([
      [
        "City",
        "Sales",
        "Orders",
        "Revenue"
      ],
      [
        "Denver",
        "$6,600",
        33,
        1800
      ],
      [
        "Dallas",
        "$5,500",
        34,
        1900
      ],
      [
        "Houston",
        "$4,200",
        35,
        1800
      ],
      [
        "Phoenix",
        "$3,000",
        32,
        1700
      ],
      [
        "Huntsville",
        "$2,800",
        31,
        1600
      ]
    ]) as unknown as string);
    // return Promise.resolve(JSON.stringify([
    //   [
    //     "Questioin",
    //     "Answer",
    //   ],
    //   [
    //     "如何解释黑洞内部的奇点对于我们对宇宙本质的理解有何重要性？",
    //     ""
    //   ],
    //   [
    //     "在生物多样性丧失的背景下，生态系统功能的稳定性如何受到影响，以及这对人类的生存和发展有何潜在影响？",
    //     ""
    //   ]
    // ]) as unknown as string);
    // return Promise.resolve(JSON.stringify(
    //   [
    //     // ["中药名", "功效"],
    //     ["苦地丁", "清热解毒。治温病高热烦躁，流感，传染性肝炎，肾炎，瘰疬，腮腺炎，疔疮及其他化脓性感染。"],
    //     ["甜地丁", "清热利湿，解毒消肿。治疔疮，痈肿，瘰疬，黄疸，痢疾，腹泻，目赤，喉痹，毒蛇咬伤。（体质虚寒者忌服）"],
    //     ["紫花地丁", "清热解毒，凉血消肿。用于疔疮肿毒，痈疽发背，丹毒，毒蛇咬伤。"],
    //     ["石见穿", "治噎膈，痰喘，肝炎，赤白带，痈肿，瘰疬。"],
    //     ["寻骨风", "治风湿关节痛，腹痛，疟疾，痈肿。（阴虚内热者忌用）"],
    //     ["积雪草", "清热利湿，消肿解毒。治痧气腹痛，暑泻，痢疾，湿热黄疸，砂淋，血淋，吐、衄、咳血，目赤，喉肿，风疹，疥癣，疔痈肿毒，跌打损伤。（虚寒者不宜）"],
    //     ["泽兰", "活血，行水。治经闭，癥瘕，产后瘀滞腹痛，身面浮肿，跌扑损伤，金疮，痈肿。（无瘀血者慎服）"],
    //     ["佩兰", "清暑，辟秽，化湿，调经。治感受暑湿，寒热头痛，湿邪内蕴，脘痞不饥，口甘苔腻，月经不调。（阴虚、气虚者忌服）"],
    //     ["千里光", "清热，解毒，杀虫，明目。治各种急性炎症性疾病，风火赤眼，目翳，伤寒，菌痢，大叶肺炎，扁桃体炎，肠炎，黄疸，流行性感冒，毒血症，败血症，痈肿疖毒，干湿癣疮，丹毒，湿疹，烫伤，滴虫性阴道炎。用于风热感冒、目赤肿痛、泄泻痢疾、皮肤湿疹疮疖。（中寒泄泻者勿服）"],
    //     ["农吉利", "清热，利湿，解毒。治痢疾，疮疖，小儿疳积。近试用于治疗癌症。"],
    //     ["瞿麦", "清热利水，破血通经。治小便不通，淋病，水肿，经闭，痈肿，目赤障翳，浸淫疮毒。（脾、肾气虚及孕妇忌服）"]
    //   ]
    // ));
  };
  setValuesByRange = async (values: string[][], row: number, col: number, numRows: number, numCols: number): Promise<void> => {
    console.log(values, row, col, numRows, numCols)
    return Promise.resolve();
  }
  getActiveRange = async () => {
    return Promise.resolve({
      address: 'A1:D12',
      col: 1,
      row: 1,
      rowNum: 12,
      colNum: 4,
      values: [
        [
          "City",
          "Sales",
          "Orders",
          "Revenue"
        ],
        [
          "Denver",
          "$6,600",
          33,
          1800
        ],
        [
          "Dallas",
          "$5,500",
          34,
          1900
        ],
        [
          "Houston",
          "$4,200",
          35,
          1800
        ],
        [
          "Phoenix",
          "$3,000",
          32,
          1700
        ],
        [
          "Huntsville",
          "$2,800",
          31,
          1600
        ]
      ]
    })
  }
  createPivotTable = async () => {
    return;
  }
  activeSheet = async (sheetName: string) => {
    return;
  }
  copySheet = async (sheetName: string, name: string) => {
    return;
  }
}

export default new SheetServiceMock();